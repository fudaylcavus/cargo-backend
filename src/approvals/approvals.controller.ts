import {
  Body,
  Controller,
  Post,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Param,
} from '@nestjs/common';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { User, UserDocument } from '../users/schemas/user.schema';

import { ApprovalsService } from './approvals.service';
import { GetApprovalCreateDto } from './dto/approval.create.dto';
import { GetApprovalIdentityDto } from './dto/approval.identity.dto';
import { GetApprovalVerifyDto } from './dto/approval.verify.dto';

@UsePipes(new ValidationPipe({ transform: true }))
@UseGuards(JwtAuthGuard)
@Controller('api/approval')
export class ApprovalsController {
  constructor(private readonly ApprovalsService: ApprovalsService) {}
  @Post('/generate')
  @HttpCode(HttpStatus.OK)
  async create(
    @GetCurrentUser('userId') userId: string,
    @Body() data: GetApprovalCreateDto,
  ) {
    return await this.ApprovalsService.createToken({ qrCreator:userId, ...data });
  }
  @Post('/delivery')
  @HttpCode(HttpStatus.OK)
  async verify(
    @GetCurrentUser('userId') userId: string,
    @Body() data: GetApprovalVerifyDto,
  ) {
    return await this.ApprovalsService.validateToken({ userId, ...data });
  }

  @Post('/identity')
  @HttpCode(HttpStatus.OK)
  async identity(
    @GetCurrentUser('userId') userId: string,
    @Body() data: GetApprovalIdentityDto,
  ) {
    return await this.ApprovalsService.verifyIdentity({ id: userId, ...data });
  }
}
