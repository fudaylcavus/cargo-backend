import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { Chat } from 'src/chats/schemas/chats.schema';

import {
  IsMongoId,
  IsNotEmpty,
} from 'class-validator';
import { User } from 'src/users/schemas/user.schema';

let shortid = require('shortid');

export type MessageDocument = Message & Document;

@Schema({timestamps:true})
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Chat' })
  @IsNotEmpty()
  @IsMongoId()
  chat:Chat
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsMongoId()
  sender:User
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  @IsNotEmpty()
  @IsMongoId()
  receiver:User
  @Prop({type:String})
  @IsNotEmpty()
  message:string
  createdAt:Date
  updatedAt:Date
  _id:mongoose.Schema.Types.ObjectId

}

export const MessageSchema = SchemaFactory.createForClass(Message);
