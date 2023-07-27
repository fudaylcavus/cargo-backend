import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CargosService } from 'src/cargos/cargos.service';
import { Cargo } from 'src/cargos/schemas/cargos.schema';
import { ChatsService } from 'src/chats/chats.service';
import { DeliveriesService } from 'src/deliveries/deliveries.service';
import { DeliveryDocument } from 'src/deliveries/schemas/deliveries.schema';
import { STATUS } from 'src/global-constants/status.enum';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Trip } from 'src/trips/schemas/trips.schema';
import { TripsService } from 'src/trips/trips.service';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import idGenerator from 'src/util/id-generator';
import {
  CreateDeliveryRequestDto,
  GetUserFromDeliveryDto,
} from './dto/create.delivery.request.dto';
import { UpdateDeliveryRequestDto } from './dto/update.delivery.request.dto';

import {
  DeliveryRequest,
  DeliveryRequestDocument,
} from './schemas/delivery.requests.schema';
let shortid = require('shortid');

@Injectable()
export class RequestsService {
  constructor(
    @InjectModel(DeliveryRequest.name)
    private readonly deliveryRequestModel: Model<DeliveryRequest>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly deliveriesService: DeliveriesService,
    private readonly tripsService: TripsService,
    private readonly notificationsService: NotificationsService,
    private readonly cargosService: CargosService,
    private readonly chatsService: ChatsService,
  ) {}
  async findAll(): Promise<DeliveryRequest[] | null> {
    return await this.deliveryRequestModel
      .find({})
      .populate({
        path: 'request',
      })
      .populate('sender receiver')
      .catch((error) => null);
  }

  async cancelRequest(
    id: string,
    user: User,
  ): Promise<DeliveryRequest | null> {
    const request = await this.deliveryRequestModel
    .findOne({ _id: id })
    .populate({
      path: 'request',
    })
    .catch((error) => null);
    if(!request) return null
    if (request.sender._id.toString() !== user.toString()){
      throw new HttpException(
        'You are not allowed for this operations!',
        HttpStatus.FORBIDDEN,
      );  
    }
    return await this.delete(id);
  }
  async getRequestsOfUser(id: string): Promise<DeliveryRequest[] | null> {
    const requests = await this.deliveryRequestModel
      .find({ receiver: id })
      .populate({
        path: 'request',
      })
      .populate('sender receiver')
      .catch((error) => null);

    return requests;
  }

  async sentRequests(id: string): Promise<DeliveryRequest[] | null> {
    const requests = await this.deliveryRequestModel
      .find({ sender: id })
      .populate({
        path: 'request',
      })
      .populate('sender receiver')
      .catch((error) => null);

    return requests;
  }

  async rejectRequest(id: string, user: User) {
    const request = await this.deliveryRequestModel
      .findOne({ _id: id })
      .populate({
        path: 'request',
      })
      .catch((error) => null);
      if(!request) return null
    if (request.receiver._id.toString() !== user.toString()){
      throw new HttpException(
        'You are not allowed for this operations!',
        HttpStatus.FORBIDDEN,
      );  
    }
    
    this.delete(id);
    return request;
  }
  async create(
    data: CreateDeliveryRequestDto,
  ): Promise<DeliveryRequestDocument> {
    const receiver = await this.getUser({
      request: data.request,
      requestType: data.requestType
    });
    const senderId = data.sender;
    const sender = await this.userModel.findById(senderId);
    if (!sender || !receiver) {
      throw new HttpException('No sender or receiver!', HttpStatus.BAD_REQUEST);
    } else if (sender._id.toString() === receiver._id.toString()) {
      throw new HttpException(
        'User cannot create request to himself!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const duplicate= await this.deliveryRequestModel.findOne({receiver:receiver._id,sender:sender._id,request:data.request})
    if(duplicate){
      throw new HttpException(
        'You already have an active request, please cancel that before sending another one!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const createdDeliveryRequest = await this.deliveryRequestModel.create({receiver:receiver._id,...data});
    console.log('before ');
    console.log(sender.sentRequests);
    console.log(receiver.receivedRequests);
    sender.sentRequests = sender.sentRequests.concat(createdDeliveryRequest);
    await sender.save();
    receiver.receivedRequests = receiver.receivedRequests.concat(
      createdDeliveryRequest,
    );
    await receiver.save();
    await this.notificationsService.sendSystemNotification({
      to: createdDeliveryRequest.receiver.pushToken,
      message: `${createdDeliveryRequest.sender.name} sana bir istek gönderdi!`,
    });
    console.log('AFTER ');
    console.log(sender.sentRequests);
    console.log(receiver.receivedRequests);
    await createdDeliveryRequest.populate({
      path: 'request sender receiver',
    });
    return createdDeliveryRequest;
  }

  private async getUser(
    data: GetUserFromDeliveryDto,
  ): Promise<UserDocument | null> {
    if (data.requestType == 'Cargo') {
      const cargo = await this.cargosService.findById(String(data.request));
      return await this.userModel.findById(cargo?.owner._id);
    } else if (data.requestType == 'Trip') {
      const trip = await this.tripsService.findById(String(data.request));
      return await this.userModel.findById(trip?.owner._id);
    } else return null;
  }
  async acceptRequest(
    id: string,
    user: User,
  ): Promise<DeliveryDocument | null> {
    const request = await this.deliveryRequestModel
      .findOne({ _id: id })
      .populate({
        path: 'request',
      });
    console.log(request);
    if (!request) {
      throw new HttpException(
        'There is no request with this id!',
        HttpStatus.BAD_REQUEST,
      );
    }
    let delivery;
    console.log(request.receiver._id)
    if (request.receiver._id.toString() !== user.toString()) {
      throw new HttpException(
        'You are not allowed for this operations!',
        HttpStatus.FORBIDDEN,
      );
    }

    if (request.requestType.toUpperCase() == 'CARGO') {
      console.log('I WILL CREATE A TRIP');

      const trip = await this.tripsService.create({
        owner: request.sender,
        volume: request.request.volume,
        weight: request.request.weight,
        price: request.request.price,
        deadline: request.request.deadline,
        from: request.request.from,
        to: request.request.to,
        deliveries: [],
        information: `This is an automatically created trip`,
      });
      delivery = await this.deliveriesService.create({
        owner: request.receiver,
        carrier: request.sender,
        cargos: [<Cargo>request.request],
        trip: trip._id,
        status: STATUS.WaitingPickUp,
        from: request.request.from,
        to: request.request.to,
        trackId: idGenerator(5),
        lastSeenLocation: '',
        lastId: undefined,
        lastToken: undefined,
      });
    } else {
      console.log('I WILL CREATE A Cargo');
      const cargo = await this.cargosService.create({
        owner: request.sender,
        volume: request.request.volume,
        weight: request.request.weight,
        price: request.request.price,
        deadline: request.request.deadline,
        from: request.request.from,
        to: request.request.to,
        information: `This is an automatically created cargo`,
        image: '',
      });
      delivery = await this.deliveriesService.create({
        owner: request.sender,
        carrier: request.receiver,
        cargos: [cargo._id],
        trip: <Trip>request.request,
        status: STATUS.WaitingPickUp,
        from: request.request.from,
        to: request.request.to,
        trackId: idGenerator(5),
        lastSeenLocation: '',
        lastId: undefined,
        lastToken: undefined,
      });
    }
    await this.delete(id);
    await this.chatsService.create({
      users: [request.sender, request.receiver],
    });
    await this.notificationsService.sendSystemNotification({
      to: request.sender.pushToken,
      message: `${request.receiver.name} isteğini kabul etti!`,
    });
    return delivery;
  }

  async findOne(user: string): Promise<DeliveryRequestDocument | null> {
    return await this.deliveryRequestModel
      .findOne({ receiver: user })
      .populate(['receiver', 'sender', 'cargo'])
      .exec()
      .catch((error) => null);
  }

  async findById(id: Number): Promise<DeliveryRequestDocument | null> {
    return await this.deliveryRequestModel
      .findOne({ _id: id })
      .populate(['receiver', 'sender', 'cargo'])
      .exec()
      .catch((error) => null);
  }
  async update(
    id: string,
    updateDeliveryRequestDto: UpdateDeliveryRequestDto,
  ): Promise<DeliveryRequestDocument | null> {
    return await this.deliveryRequestModel
      .findByIdAndUpdate(id, updateDeliveryRequestDto, { new: true })
      .exec()
      .catch((error) => null);
  }

  async delete(id: string) {
    const removedRequest = await this.deliveryRequestModel
      .findOne({ _id: id })
      .exec()
      .catch((error) => null);

    if (!removedRequest) {
      throw new HttpException('No request found!', HttpStatus.BAD_REQUEST);
    }
    const sentUser = await this.userModel.findOne({
      _id: removedRequest.sender,
    });
    const receivedUser = await this.userModel.findOne({
      _id: removedRequest.receiver,
    });
    if (sentUser) {
      sentUser.sentRequests = sentUser.sentRequests.filter(
        (element) => element._id.toString() !== removedRequest._id.toString(),
      );
      await sentUser.save();
    }
    if (receivedUser) {
      receivedUser.receivedRequests = receivedUser.receivedRequests.filter(
        (element) => element._id.toString() !== removedRequest._id.toString(),
      );
      await receivedUser.save();
      console.log(receivedUser.receivedRequests);
    }
    await removedRequest.delete();
    return removedRequest;
  }
}
