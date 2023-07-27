import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DeliveriesService } from './deliveries.service';
import {
  CreateDeliveryDto,
  GetCreateDeliveryDto,
} from './dto/create-delivery.dto';
import { Delivery, DeliveryDocument } from './schemas/deliveries.schema';
import { UpdateDeliveryDto } from './dto/update-delivery.dto';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { GetUserTrackIdDto, UserTrackIdDto } from './dto/user-trackId.dto';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { ObjectId } from 'mongoose';

@Controller('api/deliveries')
export class DeliveriesController {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(
    @GetCurrentUser('userId') userId: string,
    @Body() createDeliveryDto: CreateDeliveryDto,
  ): Promise<DeliveryDocument> {
    if (
      userId !== createDeliveryDto.owner.toString() &&
      userId !== createDeliveryDto.carrier.toString()
    ) {
      throw new HttpException('Only owners or carriers are allowed', 403);
    }
    return await this.deliveriesService.create(createDeliveryDto);
  }

  @Get('/find/:id')
  async findOne(@Param('id') id: string): Promise<Delivery | null> {
    return await this.deliveriesService.findByIdString(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/track')
  async getFollowedTracks(
    @GetCurrentUser('userId') userId: string,
  ): Promise<DeliveryDocument[] | null> {
    return await this.deliveriesService.followedDeliveries(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/track')
  async findByTrackId(
    @GetCurrentUser('userId') userId: string,
    @Body() data: GetUserTrackIdDto,
  ): Promise<Delivery | null> {
    return await this.deliveriesService.findByTrackId({ id: userId, ...data });
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/track')
  async deleteByTrackId(
    @GetCurrentUser('userId') userId: string,
    @Body() data: GetUserTrackIdDto,
  ): Promise<UserDocument | null> {
    return await this.deliveriesService.removeUserTrackId({
      id: userId,
      ...data,
    });
  }

 

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  async findDeliveriesOfUser(
    @GetCurrentUser('userId') userId: string,
  ): Promise<Delivery[] | null> {
    return await this.deliveriesService.findDeliveriesOfUser(userId);
  }

  @Get()
  async findAll(): Promise<Delivery[] | null> {
    return await this.deliveriesService.findAll();
  }


  @Get(':id')
  async findByTrackIdString(
    @Param('id') id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return await this.deliveriesService.findByTrackIdString(id);
  }
  /*
  @Patch(':id')
  async update(
    @GetCurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() updateDeliveryDto: UpdateDeliveryDto,
  ) {
    return await this.deliveriesService.update(id, updateDeliveryDto,userId);
  }

  @Delete(':id')
  async delete(
    @GetCurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return await this.deliveriesService.delete(id,userId);
  }
  */
}
