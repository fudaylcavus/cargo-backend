import { OmitType } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsMongoId, IsNotEmpty } from "class-validator";
import {IsValidTrackId} from "../../users/custom-validators/isTrackIdValid"
export class UserTrackIdDto {
  @IsNotEmpty()
  @IsValidTrackId('trackId')
  @Transform(({ value }) => value.trim())
  trackId: string;
  @IsNotEmpty()
  @IsMongoId()
  id:string;

}


export class GetUserTrackIdDto extends OmitType(UserTrackIdDto, ['id'] as const) {}
