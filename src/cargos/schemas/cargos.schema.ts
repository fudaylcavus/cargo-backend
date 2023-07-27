import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from 'src/users/schemas/user.schema';
import mongoose, { Document, ObjectId } from 'mongoose';
let shortid = require('shortid');

export type CargoDocument = Cargo & Document;

@Schema({timestamps:true})
export class Cargo {
  _id:ObjectId
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: User;
  @Prop({ type: Number })
  volume: Number;
  @Prop({ type: Number })
  weight: Number;
  @Prop({ type: Number })
  price: Number;
  @Prop(String)
  information: string;
  @Prop(String)
  from: string;
  @Prop(String)
  to: string;
  @Prop(Date)
  deadline:Date;
  @Prop(String)
  image: string;


}

export const CargoSchema = SchemaFactory.createForClass(Cargo);
