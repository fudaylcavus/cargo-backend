import { User } from 'src/users/schemas/user.schema';
import { Delivery } from 'src/deliveries/schemas/deliveries.schema';
import {
  IsDateString,
  IsEmpty,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class CreateTripDto {
  @IsNotEmpty()
  @IsMongoId()
  owner: User;
  @IsOptional()
  @IsMongoId()
  deliveries: Delivery[];
  @IsNumberString()
  @IsNotEmpty()
  volume: Number;
  @IsNumberString()
  @IsNotEmpty()
  weight: Number;
  @IsNotEmpty()
  @IsNumberString()
  price: Number;
  @IsNotEmpty()
  @IsDateString()
  deadline: Date;
  @IsOptional()
  information: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase().trim())
  from: string;
  @IsNotEmpty()
  @Transform(({ value }) => value.toUpperCase().trim())
  to: string;

}
export class GetCreateTripDto extends OmitType(CreateTripDto, ['owner'] as const) {}
