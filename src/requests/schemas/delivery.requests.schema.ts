import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, ObjectId } from 'mongoose';
import { Cargo, CargoDocument } from 'src/cargos/schemas/cargos.schema';
import { Trip, TripDocument } from 'src/trips/schemas/trips.schema';
import { User } from 'src/users/schemas/user.schema';

let shortid = require('shortid');

export type DeliveryRequestDocument = DeliveryRequest & Document;

@Schema({ timestamps: true })
export class DeliveryRequest {
  @Prop({ type: String })
  requestType: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, refPath: 'requestType' })
  request: (Cargo|Trip)
  
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  sender:User

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  receiver:User
}

export const DeliveryRequestSchema = SchemaFactory.createForClass(DeliveryRequest);
