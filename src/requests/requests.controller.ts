import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { GetCreateDeliveryDto } from 'src/deliveries/dto/create-delivery.dto';
import { UpdateDeliveryRequestDto } from './dto/update.delivery.request.dto';
import { RequestsService } from './requests.service';
import {
  DeliveryRequest,
  DeliveryRequestDocument,
} from './schemas/delivery.requests.schema';
import { GetCreateDeliveryRequestDto } from './dto/create.delivery.request.dto';
import { ObjectId } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';

@UseGuards(JwtAuthGuard)
@Controller('api/requests')
export class RequestsController {
  constructor(private readonly requestService: RequestsService) {}
  
  @UsePipes(new ValidationPipe({transform: true}))
  @Get()
  async findAll( ): Promise<DeliveryRequest[]|null> {
    return await this.requestService.findAll();
  }
  @HttpCode(HttpStatus.OK)
  @Post(':id/accept')
  async acceptRequest(@Param('id') id: string, @GetCurrentUser('userId') user: User) {
    console.log("USERRR")
    console.log(user)
    return await this.requestService.acceptRequest(id,user);
  }

  @HttpCode(HttpStatus.OK)
  @Get('user/received')
  async requestsOfUser(@GetCurrentUser('userId') userId: string) {
    return await this.requestService.getRequestsOfUser(userId);
  }


  @HttpCode(HttpStatus.OK)
  @Get('user/sent')
  async sentRequests(@GetCurrentUser('userId') userId: string) {
    return await this.requestService.sentRequests(userId);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/cancel')
  async cancelRequest(@Param('id') id: string, @GetCurrentUser('userId') user: User) {
    return await this.requestService.cancelRequest(id,user);
  }

  @HttpCode(HttpStatus.OK)
  @Post(':id/reject')
  async rejectRequest(@Param('id') id: string, @GetCurrentUser('userId') user: User) {
    return await this.requestService.rejectRequest(id,user);
  }

  @Post('')
  async create(
    @GetCurrentUser('userId') userId: User,@Body() CreateDeliveryRequestDto: GetCreateDeliveryRequestDto,
  ): Promise<DeliveryRequestDocument> {
    return await this.requestService.create({sender:userId,...CreateDeliveryRequestDto});
  }


}
