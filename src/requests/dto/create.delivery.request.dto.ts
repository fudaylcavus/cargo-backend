import { OmitType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsMongoId, IsOptional, IsNumber } from "class-validator";
import mongoose, { ObjectId } from "mongoose";
import { Cargo, CargoDocument } from "src/cargos/schemas/cargos.schema";
import { Trip, TripDocument } from "src/trips/schemas/trips.schema";
import { User } from "src/users/schemas/user.schema";
import { IsValidRequest } from "../custom-validators/isValidRequest";

export class CreateDeliveryRequestDto {
    @IsNotEmpty()
    @IsMongoId()
    @IsValidRequest('requestType','request')
    request:(Cargo|Trip)
    @IsNotEmpty()
    @IsMongoId()
    sender:User
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    requestType:string
  }
  export class GetCreateDeliveryRequestDto extends OmitType(CreateDeliveryRequestDto, ['sender'] as const) {}
  export class GetUserFromDeliveryDto extends OmitType(CreateDeliveryRequestDto, ['sender'] as const) {}
