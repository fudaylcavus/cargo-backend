import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import {
  ArrayMinSize,
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import mongoose, { Document, ObjectId } from 'mongoose';
import { Message } from 'src/messages/schemas/messsages.schema';
let shortid = require('shortid');

export type ChatDocument = Chat & Document;

@Schema({timestamps:true})
export class Chat {
  _id:ObjectId
  @Prop({type:Date})
  updatedAt:Date;
  @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}])
  @ArrayMinSize(2)
  @IsMongoId({each: true})
  users: User[];
  @Prop([{type:mongoose.Schema.Types.ObjectId, ref:'Message', default:[]}])
  @IsArray()
  @IsMongoId()
  messages:Message[];
  @Prop({type:String,default:""})
  lastMessage:string;

}

export const ChatSchema = SchemaFactory.createForClass(Chat);
