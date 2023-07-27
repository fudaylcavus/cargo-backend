import { OmitType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";

export class ApprovalVerifyDto {
    @IsNotEmpty()
    @IsMongoId()
    deliveryId: string;
    @IsNotEmpty()
    @IsString()
    lastId: string;
    @IsNotEmpty()
    @IsMongoId()
    userId:string
  }
  export class GetApprovalVerifyDto extends OmitType(ApprovalVerifyDto, ['userId'] as const) {}
