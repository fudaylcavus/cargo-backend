import {
  BadRequestException,
  ForbiddenException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { ApprovalVerifyDto } from './dto/approval.verify.dto';
import { ApprovalCreateDto } from './dto/approval.create.dto';
import { ApprovalIdentityDto } from './dto/approval.identity.dto';
import * as soap from 'soap';
import { UsersService } from 'src/users/users.service';
import { DeliveriesService } from 'src/deliveries/deliveries.service';
import { UserDocument } from 'src/users/schemas/user.schema';
import { TokenPayloadDto } from './dto/token.payload.dto';
import { STATUS } from 'src/global-constants/status.enum';
import { DeliveryDocument } from 'src/deliveries/schemas/deliveries.schema';
import idGenerator from 'src/util/id-generator';
const shortid = require('shortid');

@Injectable()
export class ApprovalsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly deliveriesService: DeliveriesService,
  ) {}

  async hashData(data: TokenPayloadDto) {
    return await bcrypt.hash(JSON.stringify(data), 10);
  }

  async verifyIdentity(data: ApprovalIdentityDto) {
    const user = await this.usersService.findByIdString(data.id);
    if (!user || !data.id) {
      throw new ForbiddenException('No user found with id provided!');
    }
    if (user.hasVerifiedIdentity) {
      return { message: 'User has already verified identity' };
    }
    if (!user.birthDate) {
      throw new BadRequestException('User has no birthdate!');
    }
    if (
      user.birthDate.getFullYear() !== new Date(data.birthDate).getFullYear() ||
      user.name.toLocaleUpperCase('TR').trim() !== data.name.toLocaleUpperCase('TR') ||
      user.surname.toLocaleUpperCase('TR').trim() !== data.surname.toLocaleUpperCase('TR')
    ) {
      console.log('==============USER=================');
      console.log(user.birthDate.getFullYear());
      console.log(user.name.toLocaleUpperCase('TR').trim());
      console.log(user.surname.toLocaleUpperCase('TR').trim());
      console.log('===========DATA=========');
      console.log(new Date(data.birthDate).getFullYear());
      console.log(data.name);
      console.log(data.surname);
      throw new ForbiddenException('Information mismatch!');
    }

    const soapURL = 'https://tckimlik.nvi.gov.tr/Service/KPSPublic.asmx?WSDL';

    const identityData = {
      TCKimlikNo: data.nationalId,
      Ad: data.name,
      Soyad: data.surname,
      DogumYili: new Date(data.birthDate).getFullYear(),
    };
    return {
      verified: await this.verifierFunction(identityData, user, soapURL)
        .then(() => true)
        .catch(() => false),
    };
  }
  private async verifierFunction(
    identityData: any,
    user: UserDocument,
    soapURL: string,
  ) {
    return new Promise((resolve, reject) => {
      soap.createClient(soapURL, async function (err, client) {
        await client.TCKimlikNoDogrula(
          identityData,
          async function (err: any, result: any) {
            if (result.TCKimlikNoDogrulaResult) {
              user.hasVerifiedIdentity = true;
              await user.save();
              return resolve(true);
            } else reject(false);
          },
        );
      });
    });
  }

  async validateToken(approvalVerifyDto: ApprovalVerifyDto): Promise<any> {
    /*
    o zaman başta 
    creator kurye
    userıd kargo sahibi

    teslim edilirken
    creator kargosahibi
    userıd kurye
    */
    const delivery = await this.deliveriesService.findByIdString(
      approvalVerifyDto.deliveryId,
    );
    if (!delivery) {
      throw new ForbiddenException('No delivery found!');
    }
    let type = this.verifyTypeDetector(approvalVerifyDto.userId, delivery);
    if (!type) {
      throw new ForbiddenException(
        'Couldn`t verify ownership of the cargo/trip or already delivered!',
      );
    }
    if (!this.idCheck(approvalVerifyDto.lastId, delivery)) {
      throw new ForbiddenException('wrong id');
    }
    const payload = {
      userId: approvalVerifyDto.userId,
      deliveryId: approvalVerifyDto.deliveryId,
      generatedID: approvalVerifyDto.lastId,
    };
    const isMatch = bcrypt.compareSync(
      JSON.stringify(payload),
      delivery.lastToken,
    );
    console.log('isMatch?: ' + isMatch);

    if (isMatch) {
      if (!this.statusChangeCheck(type, delivery.status)) {
        throw new ForbiddenException(
          'You cannot update this delivery at this stage!',
        );
      }
      if (type === 'PICKUP') {
        console.log('yola çıktı');
        delivery.status = STATUS.OnTheWay;
      } else if (type === 'DELIVERY') {
        console.log('teslim edildi');
        delivery.status = STATUS.Delivered;
      }
      await delivery.save();
    } else {
      throw new ForbiddenException('Couldnt verify!');
    }
  }

  async createToken(approvalCreateDto: ApprovalCreateDto) {
    if (approvalCreateDto.qrCreator === approvalCreateDto.userId) {
      throw new ForbiddenException('Creator and user id cannot be same!');
    }

    const delivery = await this.deliveriesService.findByIdString(
      approvalCreateDto.deliveryId,
    );
    if (!delivery) {
      throw new ForbiddenException('No delivery found!');
    }
    let type = this.createTypeDetector(approvalCreateDto.qrCreator, delivery);
    if (!type) {
      throw new ForbiddenException(
        'Couldn`t verify ownership of the cargo/trip or wrong parameter!',
      );
    }
    if (!this.statusChangeCheck(type, delivery.status)) {
      throw new ForbiddenException(
        'You cannot update this delivery at this stage!',
      );
    }
    const generatedId = idGenerator(5);
    console.log('================');
    console.log(generatedId);
    console.log('================');
    const token = await this.hashData({
      userId: approvalCreateDto.userId,
      deliveryId: approvalCreateDto.deliveryId,
      generatedId,
    });
    delivery.lastToken = token;
    delivery.lastId = generatedId;
    await delivery.save();
    return generatedId;
  }
  private verifyTypeDetector(
    userId: string,
    delivery: DeliveryDocument,
  ): string | null {
    return userId == String(delivery.cargos[0].owner._id)
      ? 'PICKUP'
      : userId == String(delivery.trip.owner._id)
      ? 'DELIVERY'
      : null;
  }

  private createTypeDetector(
    userId: string,
    delivery: DeliveryDocument,
  ): string | null {
    if (delivery.status == STATUS.Delivered) return null;
    return userId === String(delivery.cargos[0].owner._id)
      ? 'DELIVERY'
      : userId === String(delivery.trip.owner._id)
      ? 'PICKUP'
      : null;
  }

  private statusChangeCheck(type: string, status: STATUS) {
    console.log(type);
    console.log(status);
    console.log(type === 'DELIVERY' && status == STATUS.OnTheWay);
    return (
      (type == 'PICKUP' && status == STATUS.WaitingPickUp) ||
      (type === 'DELIVERY' && status == STATUS.OnTheWay)
    );
  }

  private idCheck(lastId: string, delivery: DeliveryDocument): Boolean {
    return lastId === String(delivery.lastId);
  }
}
