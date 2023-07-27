import { Transform } from "class-transformer";
import {  IsString } from "class-validator";

export enum SearchModeEnum {
  CARGO,
  CARRIER,
}
export class FilterDto {
  searchMode: SearchModeEnum;
  volume: number;
  weight: number;
  date: Date;
  @IsString()
  @Transform(({ value }) => value.toUpperCase().trim())
  from: string;
  @IsString()
  @Transform(({ value }) => value.toUpperCase().trim())
  to: string;
}
