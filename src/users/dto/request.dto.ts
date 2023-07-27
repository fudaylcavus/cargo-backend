import mongoose, { ObjectId } from "mongoose";


export class RequestDto {
    request:mongoose.Schema.Types.ObjectId;
    requestType:string

}
