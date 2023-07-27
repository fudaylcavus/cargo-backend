import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { SendNotificationDto } from './dto/notification.send.dto';
import { AddTokenDto, GetAddTokenDto } from './dto/token.add.dto';
import { NotificationsService } from './notifications.service';

@Controller('api/pushToken')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('')
  @HttpCode(HttpStatus.CREATED)
  async AddToken(
    @GetCurrentUser('userId') userId: string,
    @Body() addTokenDto: GetAddTokenDto,
  ) {
    return await this.notificationsService.addToken({ userId, ...addTokenDto });
  }
}
