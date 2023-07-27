import { User } from 'src/users/schemas/user.schema';
import { Cargo } from 'src/cargos/schemas/cargos.schema';
import { Trip } from 'src/trips/schemas/trips.schema';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsEmpty,
  IsLatLong,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { STATUS } from 'src/global-constants/status.enum';
import { OmitType } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class CreateDeliveryDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly owner: User;
  @IsNotEmpty()
  @IsMongoId()
  readonly carrier: User;
  @IsNotEmpty()
  @IsMongoId({each: true})
  @ArrayMaxSize(1)	
  readonly cargos: Cargo[];
  @IsNotEmpty()
  @IsMongoId()
  readonly trip: Trip;
  readonly status: STATUS;
  @IsEmpty()
  readonly trackId: string;
  @IsOptional()
  @IsLatLong()
  readonly lastSeenLocation: string;
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().trim())
  readonly from: string;
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.toUpperCase().trim())
  readonly to: string;
  @IsOptional()
  @IsString()
  lastToken:string|undefined
  @IsOptional()
  @IsString()
  lastId:string|undefined


}


export class GetCreateDeliveryDto extends OmitType(CreateDeliveryDto, ['owner'] as const) {}
