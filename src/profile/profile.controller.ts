import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth-guard";
import { ProfileService } from "./profile.service";



@Controller('api/profile')
export class ProfileController {
    constructor(private readonly profileService: ProfileService) {}
@Get(':id')
async getProfile(@Param('id') id:Number){
    return this.profileService.getProfile(id);
}
}