import { Transform } from "class-transformer";
import { IsOptional } from "class-validator";
import { IsValidBadge } from "../custom-validators/isBadgeValid";

export class UserBadgeDto {
  @IsValidBadge('badge')
  @Transform(({ value }) => value.toUpperCase().trim())
  badge: string;
  @IsOptional()
  amount = 1;
}
