import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { isValidObjectId, Model } from 'mongoose';
import { CargosService } from 'src/cargos/cargos.service';
import { STATUS } from 'src/global-constants/status.enum';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Trip, TripDocument } from 'src/trips/schemas/trips.schema';
import { TripsService } from 'src/trips/trips.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { isValidId } from 'src/util/helper-functions';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { UserTrackIdDto } from './dto/user-trackId.dto';
import { Delivery, DeliveryDocument } from './schemas/deliveries.schema';

@Injectable()
export class DeliveriesService {
  constructor(
    @InjectModel(Delivery.name)
    private readonly deliveryModel: Model<DeliveryDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,

    private readonly cargosService: CargosService,
    private readonly notificationsService: NotificationsService,
  ) {}
  async findDeliveriesOfUser(id: string): Promise<Delivery[] | null> {
    isValidId(id)
    const owned = await this.deliveryModel
      .find({ owner: id })
      .populate(['owner', 'carrier', 'cargos', 'trip']);
    const carried = await this.deliveryModel
      .find({ carrier: id })
      .populate(['owner', 'carrier', 'cargos', 'trip']);
    return [...owned, ...carried];
  }
  async create(deliveryDto: CreateDeliveryDto): Promise<DeliveryDocument> {
    const carrier = await this.userModel
      .findOne({ _id: deliveryDto.carrier })
      .catch((error) => null);
    const owner = await this.userModel
      .findOne({ _id: deliveryDto.owner })
      .catch((error) => null);
    const trip = await this.tripModel
      .findOne({ _id: deliveryDto.trip })
      .catch((error) => null);

    if (!carrier || !owner) {
      throw new HttpException(
        'There is no account associated with this carrier or owner',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (carrier._id.toString() === owner._id.toString()) {
      console.log(carrier._id)
      console.log(owner._id)
      throw new HttpException(
        'User cannot deliver his own cargo!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const cargos = await this.cargosService.findCargosThenCheck(
      deliveryDto.cargos,
      deliveryDto.trip.deadline,
    );

    if (!trip || !cargos) {
      throw new HttpException(
        'Trip couldnt be found or One of the Cargos couldn`t be found; or one of the cargos is already in another delivery!',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (
      cargos[0].owner.toString() !== deliveryDto.owner.toString() ||
      trip.owner.toString() !== deliveryDto.carrier.toString()
    ) {
      throw new HttpException(
        'Cargo owner or trip owner doesnt match with the info provided on delivery!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const weights = [Number(trip.weight), Number(cargos[0].weight)];
    const volumes = [Number(trip.volume), Number(cargos[0].volume)];
    if (!(this.spaceChecker(weights, volumes))) {
      throw new HttpException(
        'Cargo weight/volume is bigger than trip space!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const delivery = await this.deliveryModel.create(deliveryDto);
    trip.weight = Number(trip.weight) - Number(cargos[0].weight);
    trip.volume = Number(trip.volume) - Number(cargos[0].volume);
    trip.deliveries = owner.deliveries.concat(delivery._id);
    await trip.save();
    carrier.deliveries = carrier.deliveries.concat(delivery._id);
    await carrier.save();
    owner.deliveries = owner.deliveries.concat(delivery._id);
    await owner.save();

    return delivery;
  }

  private spaceChecker(weights: number[], volumes: number[]): Boolean {
    return weights[0] - weights[1] >= 0 && volumes[0] - volumes[1] >= 0;
  }

  async findAll(): Promise<Delivery[] | null> {
    return await this.deliveryModel
      .find()
      .populate(['owner', 'carrier', 'cargos', 'trip'])
      .exec()
      .catch((error) => null);
  }

  async findOneByCargo(cargoId: string): Promise<DeliveryDocument | null> {
    isValidId(cargoId)
    const delivery = await this.deliveryModel
      .findOne({ cargos: new mongoose.Types.ObjectId(cargoId) })
      .catch((error) => null);
    console.log(delivery);
    return delivery;
  }

  async findByTrackId(data: UserTrackIdDto): Promise<DeliveryDocument | null> {
    const delivery = await this.deliveryModel
      .findOne({ trackId: data.trackId })
      .populate(['owner', 'carrier', 'cargos'])
      .exec()
      .catch((error) => null);

    if (delivery) {
      let userId = data.id;
      const user = await this.userModel
        .findOne({ _id: userId })
        .catch((error) => null);
      if (user && !user.trackIds.includes(data.trackId)) {
        user.trackIds = user.trackIds.concat(data.trackId);
        await user.save();
      }
    }
    return delivery;
  }

  async followedDeliveries(userId: string): Promise<DeliveryDocument[] | null> {

    isValidId(userId)
    const user = await this.userModel.findOne({ _id: userId });
    if (!user) throw new HttpException('Couldnt find user with given id', 404);
    let deliveries: DeliveryDocument[] = [];
    for (let trackId of user.trackIds) {
      console.log(trackId);
      const delivery = await this.deliveryModel
        .findOne({ trackId })
        .populate(['owner', 'carrier', 'cargos'])
        .exec()
        .catch((error) => null);
      if (delivery) deliveries.push(delivery);
    }
    return deliveries;
  }

  async findByTrackIdString(trackId: string): Promise<DeliveryDocument | null> {
    const delivery = await this.deliveryModel
      .findOne({ trackId })
      .exec()
      .catch((error) => null);
    console.log(delivery);
    return delivery;
  }

  async removeUserTrackId(data: UserTrackIdDto): Promise<UserDocument | null> {
    let userId = data.id;
    const user = await this.userModel
      .findOne({ _id: userId })
      .catch((error) => null);
    if (!user) {
      throw new HttpException('No user found with id!', HttpStatus.BAD_REQUEST);
    }
    user.trackIds = user.trackIds.filter((element) => element !== data.trackId);
    await user.save();
    return null;
  }

  async findOneByTrackId(id: string): Promise<DeliveryDocument | null> {

    const delivery = await this.deliveryModel
      .findOne({ trackId: id })
      .populate(['owner', 'carrier', 'cargos'])
      .exec()
      .catch((error) => null);
    return delivery;
  }

  async findById(id: Number): Promise<DeliveryDocument | null> {
    isValidId(String(id))
    const delivery = await this.deliveryModel
      .findOne({ _id: id })
      .populate(['owner', 'carrier', 'cargos'])
      .exec()
      .catch((error) => null);
    return delivery;
  }
  private async update(
    id: string,
    updateDeliveryDto: UpdateDeliveryDto,
    userId:string
  ): Promise<DeliveryDocument | null> {
    isValidId(id)
    const delivery = await this.deliveryModel
      .findOne({ _id: id })
      .catch((error) => null);
    if (!delivery) {
      throw new HttpException(
        'There is delivery with this id',
        HttpStatus.BAD_REQUEST,
      );
    }
    if(delivery.owner._id.toString()!==userId){
      throw new HttpException('Unauthorized', 403);

    }
    if (delivery.status === STATUS.Delivered) {
      throw new HttpException(
        'This delivery has been Delivered and cannot be mutated',
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.notificationsService.sendSystemNotification({
      to: delivery.owner.pushToken,
      message: `Kargonun durumu güncellendi!`,
    });
    return await this.deliveryModel
      .findByIdAndUpdate(id, updateDeliveryDto, { new: true })
      .exec();
  }

  private async delete(id: string, userId:string) {
    isValidId(id)
    const deletedDelivery = await this.deliveryModel
      .findByIdAndRemove({ _id: id })
      .exec();
    if (!deletedDelivery) {
      throw new HttpException('Couldnt find delivery', HttpStatus.BAD_REQUEST);
    }
    if(deletedDelivery.owner._id.toString()!==userId){
      throw new HttpException('Unauthorized', 403);

    }
    const users = await this.userModel
      .find({ deliveries: { $in: id } })
      .catch((error) => null);
    if (users) {
      for (let i = 0; i < users.length; i++) {
        let user = users[i];
        user.deliveries = user.deliveries.filter(
          (element) =>
            element._id.toString() !== deletedDelivery._id.toString(),
        );
        await user.save();
      }
    }
    const trip = await this.tripModel
      .findOne({ deliveries: { $in: id } })
      .catch((error) => null);
    if (trip) {
      trip.deliveries = trip.deliveries.filter(
        (element) => element._id.toString() !== deletedDelivery._id.toString(),
      );
      await trip.save();
    }
    return deletedDelivery;
  }
  async findByIdString(id: string): Promise<DeliveryDocument | null> {
    isValidId(id)
    return await this.deliveryModel
      .findOne({ _id: id })
      .populate('trip cargos')
      .exec()
      .catch((error) => null);
  }
}
