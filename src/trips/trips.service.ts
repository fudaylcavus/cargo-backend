import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery, DeliveryDocument } from 'src/deliveries/schemas/deliveries.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip, TripDocument } from './schemas/trips.schema';

@Injectable()
export class TripsService {
  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Delivery.name) private readonly deliveryModel: Model<DeliveryDocument>,

  ) {}

  async create(tripDto: CreateTripDto): Promise<TripDocument> {
    const user=await this.userModel.findOne({_id:tripDto.owner}).catch(error=>null)
    if(!user) {
      throw new HttpException(
        'There is no account',
        HttpStatus.BAD_REQUEST,
      );
    }    
    const trip= await this.tripModel.create(tripDto);
    user.trips=user.trips.concat(trip._id)
    await user.save()
    return trip
  }

  async findAll(): Promise<Trip[]> {
    return this.tripModel.find().populate(['owner', 'deliveries']).exec();
  }



  async findById(id: string): Promise<TripDocument | null> {
    return await this.tripModel.findOne({ _id: id })
    .populate(['owner', 'deliveries'])
    .exec();
 
  }
  async update(
    id: string,
    userId:string,
    UpdateTripDto: UpdateTripDto,
  ): Promise<TripDocument | null> {
    const trip = await this.findById(id).catch(error=>null)
    if(!trip) throw new HttpException("Couldnt find trip!",404)
    if(trip.owner._id.toString()!==userId.toString()) throw new HttpException("Unauthorized!",403)
    return this.tripModel
      .findByIdAndUpdate(id, UpdateTripDto, { new: true })
      .exec().catch(error=>null)
  }

  async delete(id: string, userId:string) {
   const deletedTrip= await this.tripModel
      .findOne({ _id: id })
      .exec().catch(error=>null)
      if(!deletedTrip){
        throw new HttpException(
          'Couldnt find trip',
          404
        );
      }
      if(deletedTrip.owner._id.toString()!==userId.toString()) throw new HttpException("Unauthorized!",403)

      const delivery=await this.deliveryModel.findOne({trip:deletedTrip._id}).catch(error=>null)
      if(delivery){
        throw new HttpException(
          'You cannot delete a trip once it has a active delivery!',
          HttpStatus.BAD_REQUEST,
        );
      }

      const users=await this.userModel.find({trips:{$in:id}}).catch(error=>null)
      if(users){
        for(let i=0;i<users.length;i++){
          let user=users[i];
          user.trips=user.trips.filter(element=>element._id.toString()!==deletedTrip._id.toString())
          await user.save();
        }
      }
      await deletedTrip.delete();
      return deletedTrip;
  }
}
