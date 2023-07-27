import { OmitType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";
import { ExpoPushToken } from "expo-server-sdk";
import { IsExpoToken } from "../validator/isValidPushToken";


export class AddTokenDto {
    @IsNotEmpty()
    @IsMongoId()
  userId:string
  @IsNotEmpty()
  @IsExpoToken('pushToken')
  pushToken:ExpoPushToken
}
export class GetAddTokenDto extends OmitType(AddTokenDto, ['userId'] as const) {}
