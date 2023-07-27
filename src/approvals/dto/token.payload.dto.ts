import { IsMongoId, IsNotEmpty, IsOptional, IsPositive, IsString } from "class-validator";

export class TokenPayloadDto {
  @IsNotEmpty()
  @IsMongoId()
  userId:string;
    @IsNotEmpty()
    @IsMongoId()
    deliveryId: string;
    @IsNotEmpty()
    @IsString()
    generatedId: string
  }
  