import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { User } from 'src/users/schemas/user.schema';

import { CreateTripDto, GetCreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip, TripDocument } from './schemas/trips.schema';
import { TripsService } from './trips.service';

@Controller('api/trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  @Post()
  async create(
    @GetCurrentUser('userId') userId: User,
    @Body() createTripDto: GetCreateTripDto,
  ): Promise<TripDocument> {
    return await this.tripsService.create({ owner: userId, ...createTripDto });
  }

  @Get()
  async findAll(): Promise<Trip[]> {
    return this.tripsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @GetCurrentUser('userId') userId: string,
    @Body() updateTripDto: UpdateTripDto,
  ) {
    return this.tripsService.update(id, userId, updateTripDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.tripsService.delete(id, userId);
  }
}
