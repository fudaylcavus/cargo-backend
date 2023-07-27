import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { User, UserDocument } from '../users/schemas/user.schema';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth-guard';
import { JwtRefreshGuard } from './guards/jwt-refresh-guard';
import { GetCurrentUser } from './decorators/get-current-user.decorator';
import { Tokens } from './types/tokens.type';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';
import { ApprovalIdentityDto } from 'src/approvals/dto/approval.identity.dto';
import { ApprovalsService } from 'src/approvals/approvals.service';
import { SignupInfo } from './types/signupInfo.type';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('api/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly approvalService: ApprovalsService,
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() user: AuthDto) {
    return this.authService.login(user);
  }
  @Post('/signup')
  @HttpCode(207)
  async createUser(
    @Body()
    body: CreateUserDto & ApprovalIdentityDto,
  ): Promise<SignupInfo> {
    const tokens = await this.authService.signUp(body);
    const identity = body.nationalId
      ? await this.approvalService.verifyIdentity({ ...body, id: tokens._id }).then((res)=>res.verified)
      : undefined;
    return {
      ...tokens,
      identity,
    };
  }
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  logout(@GetCurrentUser('userId') userId: string) {
    return this.authService.logout(userId);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  refreshTokens(
    @GetCurrentUser('userId') userId: number,
    @GetCurrentUser('refreshToken') userRefreshToken: string,
  ) {
    return this.authService.refreshTokens(userId, userRefreshToken);
  }
}
