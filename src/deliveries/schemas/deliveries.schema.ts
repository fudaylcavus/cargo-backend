import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import {
  ArrayMaxSize,
  IsEmpty,
  IsLatLong,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import mongoose, { Document, ObjectId } from 'mongoose';
import { Cargo } from 'src/cargos/schemas/cargos.schema';
import { Trip } from 'src/trips/schemas/trips.schema';
import { STATUS } from 'src/global-constants/status.enum';
import idGenerator from 'src/util/id-generator';
let shortid = require('shortid');

export type DeliveryDocument = Delivery & Document;

@Schema({timestamps:true})
export class Delivery {
  _id:ObjectId
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsMongoId()
  owner: User;
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsMongoId()
  carrier: User;
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Cargo' }])
  @IsNotEmpty()
  @IsMongoId({each: true})
  @ArrayMaxSize(1)	
  cargos: Cargo[];
  @Prop({type:mongoose.Schema.Types.ObjectId, ref:'Trip'})
  trip:Trip
  @Prop({ type: String, enum:Object.values(STATUS), default: STATUS.WaitingPickUp })
  status: STATUS;
  @Prop({ type: String, default: idGenerator(5) })
  @IsEmpty()
  trackId: string;
  @Prop({ type: String })
  @IsOptional()
  @IsLatLong()
  lastSeenLocation: string;
  @Prop(String)
  from: string;
  @Prop(String)
  to: string;
  @Prop(String)
  lastToken:string
  @Prop(String)
  lastId:string
}

export const DeliverySchema = SchemaFactory.createForClass(Delivery);
