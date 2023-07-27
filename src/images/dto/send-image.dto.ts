import { OmitType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class SendImageDto {
 
    @IsNotEmpty()
    @IsMongoId()
    id:string
    @IsNotEmpty()
    @IsString()
    readonly type:string;

}   

export class GetSendImageDto extends OmitType(SendImageDto, ['id'] as const) {}
