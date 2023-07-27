import { OmitType } from "@nestjs/swagger";
import { IsNotEmpty, IsMongoId, IsOptional } from "class-validator";
import { Chat } from "src/chats/schemas/chats.schema";
import { User } from "src/users/schemas/user.schema";

export class CreateMessageDto {
    @IsNotEmpty()
    @IsMongoId()
    chat:Chat
    @IsNotEmpty()
    message:string
    @IsNotEmpty()
    @IsMongoId()
    sender:User|string
    @IsNotEmpty()
    @IsMongoId()
    receiver:User|string
    @IsOptional()
    createdAt:Date
    @IsOptional()
    updatedAt:Date
  }
  
  export class GetSendMessageDto extends OmitType(CreateMessageDto, ['sender'] as const) {}
  export class GetReceiveMessageDto extends OmitType(CreateMessageDto, ['receiver'] as const) {}
