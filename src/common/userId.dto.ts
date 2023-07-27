import { IsNotEmpty, IsMongoId } from "class-validator";

export class userIdDto{
    @IsNotEmpty()
    @IsMongoId()
    userId:string;
  }