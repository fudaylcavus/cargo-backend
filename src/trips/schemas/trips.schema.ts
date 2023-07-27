import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import { Delivery } from 'src/deliveries/schemas/deliveries.schema';
import {
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import mongoose, { Document, ObjectId } from 'mongoose';

export type TripDocument = Trip & Document;

@Schema({ timestamps: true })
export class Trip {
  _id:ObjectId
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsMongoId()
  owner: User;
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' }])
  @IsOptional()
  @IsMongoId()
  deliveries: Delivery[];
  @Prop({ type: Number })
  @IsNumberString()
  @IsNotEmpty()
  volume: Number;
  @Prop({ type: Number })
  @IsNumberString()
  @IsNotEmpty()
  weight: Number;
  @Prop({ type: Date, required: true })
  @IsNotEmpty()
  @IsDateString()
  deadline: Date;
  @Prop({ type: Number, required: true })
  @IsNotEmpty()
  @IsNumberString()
  price: Number;
  @Prop(String)
  information: string;
  @Prop(String)
  from: string;
  @Prop(String)
  to: string;


}
  /*
    deliveries: [{type:Schema.Types.ObjectId, ref:'Delivery}]
    trips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }], 
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    badges: [{ type: Schema.Types.ObjectId, ref: 'Badge' }],
    */
export const TripSchema = SchemaFactory.createForClass(Trip);
