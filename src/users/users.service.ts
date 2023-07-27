import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserBadgeDto } from './dto/user-badge.dto';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService
  ) {}

  async create(userDto: CreateUserDto): Promise<UserDocument> {
    const { phone, email } = userDto;

    // check if the user exists in the db
    if(phone){
      const phoneInDb = await this.userModel.findOne({ phone });
      if (phoneInDb) {
        throw new HttpException(
          'There is already an account associated with this phone!',
          HttpStatus.BAD_REQUEST,
        );
      }
    } 
    const emailInDb = await this.userModel.findOne({ email });

    if (emailInDb) {
      throw new HttpException(
        'There is already an account associated with this e-mail!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const createdUser = await this.userModel.create(userDto);
    return createdUser;
  }

  async findAll(): Promise<User[]> {
    return (
      this.userModel
        .find()
        // .populate(['trips', 'deliveries', 'cargos', 'badges.badge','sentRequests','receivedRequests'], )
        .populate({
          path: 'sentRequests receivedRequests',
          populate: {
            path: 'request',
          },
        })
        .populate('deliveries')
        .exec()
    );
  }

  async findOne(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email: email }).exec().catch(error=>null)
  }

  async findById(id: Number): Promise<UserDocument | null> {
    return await this.userModel.findOne({ _id: id }).exec().catch(error=>null)
  }
  async findByIdString(id: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ _id: id }).exec().catch(error=>null)
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument | null> {
    if(updateUserDto.password){
      updateUserDto.password=await this.hashData(updateUserDto.password)
    }
    return await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async updateBadge(
    id: string,
    data: UserBadgeDto[],
  ): Promise<UserDocument | null> {
    const user = await this.userModel.findOne({ _id: id });
    if (!user) return null;
    console.log('BFOERE FOR');
    console.log(data.length);
    for (let i = 0; i < data.length; i++) {
      data[i].badge = data[i].badge.toUpperCase();
      const index = user.badges.findIndex(
        (element) => element.badge == data[i].badge,
      );
      console.log('CHECKINDEX');
      console.log(index);
      if (index == -1) user.badges = user.badges.concat(data[i]);
      else {
        console.log('CHECK');
        console.log(user.badges[index]);
        user.badges[index].amount += 1;
      }
      await this.notificationsService.sendSystemNotification({to:user.pushToken,message:`Harikasın! Birisi sana ${data[i].badge} gönderdi!`})
    }

    return await this.userModel
      .findByIdAndUpdate(id, user, { new: true })
      .exec();
  }


  async topBadges(id: string): Promise<string[]> {
    const user = await this.userModel.findOne({ _id: id }).exec().catch(error=>null);
    if (!user) throw new HttpException("Couldnt find user with that id", 404);
    let topBadges = user.badges.sort((a, b) => b.amount - a.amount).slice(0, 3);
    return topBadges.map((element) => element.badge);
  }

  async delete(id: string) {
    return await this.userModel.findByIdAndRemove({ _id: id }).exec()
  }

  private async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }
}
