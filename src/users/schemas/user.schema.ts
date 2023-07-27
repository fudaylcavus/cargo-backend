import { Prop, raw, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  IsEmail,
  IsEmpty,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ExpoPushToken } from 'expo-server-sdk';
import mongoose, { Document, Types } from 'mongoose';
import { Cargo, CargoDocument } from 'src/cargos/schemas/cargos.schema';
import { Chat } from 'src/chats/schemas/chats.schema';
import { Delivery } from 'src/deliveries/schemas/deliveries.schema';
import { IsExpoToken } from 'src/notifications/validator/isValidPushToken';
import {
  DeliveryRequest,
  DeliveryRequestDocument,
} from 'src/requests/schemas/delivery.requests.schema';
import { Trip } from 'src/trips/schemas/trips.schema';
import { UserBadgeDto } from '../dto/user-badge.dto';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  _id: mongoose.Schema.Types.ObjectId
  @Prop({ type: String, required: true })
  @IsNotEmpty()
  @IsString()
  name: string;
  @Prop({ type: String })
  @IsOptional()
  @IsString()
  surname: string;
  @Prop({ type: String })
  @IsOptional()
  @IsPhoneNumber()
  phone: string;
  @Prop({ type: String, required: true, unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @Prop({ type: String, default: '' })
  image: string;
  @Prop({ type: String, default: '' })
  information: string;
  @Prop({ default: false })
  @IsEmpty()
  hasVerifiedIdentity: Boolean;
  @Prop({type:Date})
  birthDate:Date;
  @Prop({ default: false })
  @IsEmpty()
  hasVerifiedPhone: Boolean;
  @Prop({ required: true })
  @IsNotEmpty()
  password: string;
  @Prop({type:String,default:""})
  address: string;
  @Prop({ type: Number, default: 0 })
  @IsEmpty()
  rating: Number;
  @Prop({ type: Number, default: 0 })
  @IsEmpty()
  ratingCount: Number;
  @Prop({ type: Number, default: 0 })
  @IsEmpty()
  sentCargoCount: Number;
  @Prop({ type: Number, default: 0 })
  @IsEmpty()
  deliveredCargoCount: Number;
  @Prop(String)
  refreshToken: string;
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Cargo' }])
  @IsOptional()
  @IsMongoId({ each: true })
  cargos: Cargo[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' }])
  @IsOptional()
  @IsMongoId({ each: true })
  deliveries: Delivery[];
  @IsMongoId({ each: true })
  @IsOptional()
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Trip' }])
  trips: Trip[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' }])
  @IsOptional()
  @IsMongoId({ each: true })
  chats: Chat[];
  @Prop([{ type: UserBadgeDto }])
  badges: UserBadgeDto[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryRequest' }])
  sentRequests: DeliveryRequestDocument[];
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryRequest' }])
  receivedRequests: DeliveryRequestDocument[];
  @Prop([String])
  trackIds:string[];
  createdAt: Date;
  updatedAt: Date;
  @Prop(String)
  @IsOptional()
  newsLetter:boolean
  @Prop(String)
  @IsOptional()
  @IsExpoToken('pushToken')
  pushToken:string

  /*
    chats: [{ type: Schema.Types.ObjectId, ref: 'Chat' }],
    */
}
export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.set('toJSON', {
  transform: function (doc, ret, opt) {
    delete ret['password'];
    delete ret['refreshToken'];
    return ret;
  },
});
