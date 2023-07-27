import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
  } from 'class-validator';
  import { ExpoPushToken } from 'expo-server-sdk';
  import { ObjectId } from 'mongoose';
  import { IsExpoToken } from '../validator/isValidPushToken';
  
  export class NewMessageDto {
    @IsNotEmpty()
    @IsMongoId()
    id: ObjectId;
    @IsOptional()
    @IsExpoToken('to')
    to: ExpoPushToken;
    @IsString()
    message:string;
  }
  