import { User } from 'src/users/schemas/user.schema';
import {
  IsDateString,
  IsEmpty,
  IsMongoId,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { OmitType } from '@nestjs/swagger';

export class CreateCargoDto {
  @IsNotEmpty()
  @IsMongoId()
  readonly owner: User|string;
  @IsNumberString()
  @IsNotEmpty()
  readonly volume: Number;
  @IsNumberString()
  @IsNotEmpty()
  readonly weight: Number;
  @IsNumberString()
  @IsNotEmpty()
  readonly price: Number;
  @IsOptional()
  readonly information: string;
  @IsString()
  @Transform(({ value }) => value.toUpperCase().trim())
  readonly from: string;
  @IsString()
  @Transform(({ value }) => value.toUpperCase().trim())
  readonly to: string;
  @IsDateString()
  readonly deadline:Date;
  @IsOptional()
  image:string;

}

export class GetCreateCargoDto extends OmitType(CreateCargoDto, ['owner'] as const) {}

