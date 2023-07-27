import { IsNotEmpty, IsMongoId, IsOptional, IsArray, ArrayMinSize } from "class-validator";
import { ObjectId } from "mongoose";
import { User } from "src/users/schemas/user.schema";

export class CreateChatDto {
  @ArrayMinSize(2)
  @IsMongoId({each: true})
    users: (User)[];
  
  }

  export class GetOtherUser{
    @IsMongoId()
    @IsNotEmpty()
    user:User
  }
  