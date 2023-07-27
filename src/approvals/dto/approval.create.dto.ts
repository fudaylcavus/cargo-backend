import { OmitType } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class ApprovalCreateDto {
  @IsNotEmpty()
  @IsMongoId()
  userId:string;
  @IsNotEmpty()
  @IsMongoId()
  qrCreator:string;
    @IsNotEmpty()
    @IsMongoId()
    deliveryId: string;

  }
  
  export class GetApprovalCreateDto extends OmitType(ApprovalCreateDto, ['qrCreator'] as const) {}
