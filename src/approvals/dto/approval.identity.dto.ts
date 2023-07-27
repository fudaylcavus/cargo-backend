import { OmitType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsDate, IsDateString, IsIdentityCard, IsMongoId, IsNotEmpty, IsNumberString, IsString } from "class-validator";

export class ApprovalIdentityDto {
    @IsNotEmpty()
    @IsMongoId()
    id: string;
    @IsNotEmpty()
    @IsNumberString()
    @Transform(({ value }) => value.trim())
    nationalId: string;
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLocaleUpperCase("TR").trim())
    name: string;
    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.toLocaleUpperCase("TR").trim())
    surname:string;
    @IsNotEmpty()
    @IsDateString()
    birthDate:string;
  }
  
  export class GetApprovalIdentityDto extends OmitType(ApprovalIdentityDto, ['id'] as const) {}
