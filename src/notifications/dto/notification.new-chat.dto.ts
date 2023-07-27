import {
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ExpoPushToken } from 'expo-server-sdk';
import { ObjectId } from 'mongoose';
import { IsExpoToken } from '../validator/isValidPushToken';

export class NewChatDto {
  @IsNotEmpty()
  @IsMongoId()
  id: ObjectId;
  @IsOptional()
  @IsExpoToken('to')
  to: ExpoPushToken;
}
