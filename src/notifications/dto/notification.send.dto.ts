import { IsEmpty, IsJSON, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { ExpoPushToken } from "expo-server-sdk";
import { IsExpoToken } from "../validator/isValidPushToken";


export class SendNotificationDto {
   @IsOptional()
    body?:string
    @IsOptional()
    @IsExpoToken('to')
    to: ExpoPushToken
    @IsEmpty()
    sound?: 'default'
    @IsOptional()
    @IsJSON()
    data?: JSON
}
