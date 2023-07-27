import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Delivery,
  DeliveryDocument,
} from 'src/deliveries/schemas/deliveries.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { Cargo, CargoDocument } from './schemas/cargos.schema';

@Injectable()
export class CargosService {
  constructor(
    @InjectModel(Cargo.name) private readonly cargoModel: Model<CargoDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Delivery.name)
    private readonly deliveryModel: Model<DeliveryDocument>,
  ) {}

  async create(cargoDto: CreateCargoDto): Promise<CargoDocument> {
    const user = await this.userModel.findOne({ _id: cargoDto.owner });
    if (!user) {
      throw new HttpException('There is no account', HttpStatus.BAD_REQUEST);
    }
    const cargo = await this.cargoModel.create(cargoDto);

    user.cargos = user.cargos.concat(cargo._id);
    await user.save();
    return cargo;
  }

  async findAll(): Promise<Cargo[] | null> {
    return this.cargoModel
      .find()
      .populate('owner')
      .exec()
      .catch((error) => null);
  }

  async findByIdString(id: string): Promise<CargoDocument | null> {
    return await this.cargoModel
      .findOne({ _id: id })
      .exec()
      .catch((error) => null);
  }

  async findCargosThenCheck(
    idArray: Cargo[],
    date: Date,
  ): Promise<CargoDocument[] | null> {
    let cargos = [];
    console.log(idArray);
    const idArrayLength = idArray.length;
    for (let i = 0; i < idArrayLength; i++) {
      let id = idArray[i];
      let isInAnyOtherDelivery = await this.deliveryModel.findOne({
        cargos: { $in: id },
      });
      if (isInAnyOtherDelivery) return null;
      console.log(id);
      let cargo = await this.cargoModel
        .findOne({ _id: id })
        .catch((error) => null);
      console.log(cargo);
      //if(cargo&&cargo.deadline>=date) cargos.push(cargo);
      if (cargo) cargos.push(cargo);
      else return null;
    }
    return cargos;
  }

  async findOne(trackId: string): Promise<CargoDocument | null> {
    return await this.cargoModel
      .findOne({ trackId })
      .populate('owner')
      .exec()
      .catch((error) => null);
  }

  async findById(id: string): Promise<CargoDocument | null> {
    return await this.cargoModel
      .findOne({ _id: id })
      .populate('owner')
      .exec()
      .catch((error) => null);
  }
  async update(
    id: string,
    updateCargoDto: UpdateCargoDto,
    userId: string,
  ): Promise<CargoDocument | null> {
    const cargoToUpdate = await this.cargoModel
      .findOne({ _id: id })
      .exec()
      .catch((error) => null);
    if (!cargoToUpdate) {
      throw new HttpException('Couldnt find cargo', HttpStatus.BAD_REQUEST);
    }
    if (userId === cargoToUpdate.owner._id.toString())
      return await this.cargoModel
        .findByIdAndUpdate(id, updateCargoDto, { new: true })
        .exec()
        .catch((error) => null);
    throw new HttpException(
      'You cant update this cargo as you are not the owner',
      403,
    );
  }

  async delete(id: string, userId: string) {
    const deletedCargo = await this.cargoModel
      .findOne({ _id: id })
      .exec()
      .catch((error) => null);
    if (!deletedCargo) {
      throw new HttpException('Couldnt find cargo', HttpStatus.BAD_REQUEST);
    }
    if (deletedCargo.owner._id.toString() !== userId) {
      throw new HttpException(
        'You cannot delete a cargo that is not yours!',
        403,
      );
    }
    const delivery = await this.deliveryModel
      .findOne({ cargos: { $in: deletedCargo._id } })
      .catch((error) => null);
    if (delivery) {
      throw new HttpException(
        'You cannot delete a cargo once it has a active delivery!',
        HttpStatus.BAD_REQUEST,
      );
    }

    const users = await this.userModel
      .find({ cargos: { $in: id } })
      .catch((error) => null);
    if (users) {
      for (let i = 0; i < users.length; i++) {
        let user = users[i];
        user.cargos = user.cargos.filter(
          (element) => element._id.toString() !== deletedCargo._id.toString(),
        );
        await user.save();
      }
    }
    await deletedCargo.delete();
    return deletedCargo;
  }
}
