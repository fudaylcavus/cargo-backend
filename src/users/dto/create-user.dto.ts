import { Transform } from 'class-transformer';
import {
  IsBooleanString,
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';
import { ExpoPushToken } from 'expo-server-sdk';
import { Delivery } from 'src/deliveries/schemas/deliveries.schema';
import { IsExpoToken } from 'src/notifications/validator/isValidPushToken';
import { DeliveryRequestDocument } from 'src/requests/schemas/delivery.requests.schema';
import { Trip } from 'src/trips/schemas/trips.schema';
import { IsValidTrackId } from '../custom-validators/isTrackIdValid';
import { UserBadgeDto } from './user-badge.dto';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  name: string;
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim())
  surname: string;
  @IsOptional()
  @IsPhoneNumber()
   phone: string;
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;
  @IsNotEmpty()
  @IsDateString()
  birthDate: Date;
  information: string;
  image: string;
  hasVerifiedIdentity: Boolean;
  hasVerifiedPhone: Boolean;
  @IsNotEmpty()
  @IsString()
  password: string;
  address: string;
  rating: Number;
  ratingCount: Number;
  sentCargoCount: Number;
  deliveredCargoCount: Number;
  refreshToken: string | null;
  @IsOptional()
  @IsMongoId()
  trips: Trip[];
  @IsOptional()
  @IsMongoId()
  deliveries: Delivery[];
  @IsOptional()
  @IsMongoId()
  sentRequests: DeliveryRequestDocument[];
  @IsOptional()
  @IsMongoId()
  receivedRequests: DeliveryRequestDocument[];
  @IsOptional()
  @IsValidTrackId('trackIds')
  trackIds:string[]
  badges: UserBadgeDto[];
  @IsOptional()
  @IsBooleanString()
  newsLetter:boolean
  @IsOptional()
  @IsExpoToken('pushToken')
  pushToken:ExpoPushToken

}
