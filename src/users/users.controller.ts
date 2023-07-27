import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpException,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserBadgeDto } from './dto/user-badge.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('/giveBadge/:id')
  @UsePipes(new ValidationPipe({ transform: true }))
  async updateBadge(
    @GetCurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body(new ParseArrayPipe({ items: UserBadgeDto })) data: UserBadgeDto[],
  ) {
    if(userId===id){
      throw new HttpException("You cant give badge to yourself", 403)
    }
    return this.usersService.updateBadge(id, data);
  }

  
  @Get('/topBadges/:id')
  async getBadge(@Param('id') id: string) {
    return this.usersService.topBadges(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('')
  async update(
    @Body() updateUserDto: UpdateUserDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    const user = await this.usersService.findByIdString(userId);
    if (!user) {
      throw new ForbiddenException('No user found with id provided!');
    } else {
      if (user.hasVerifiedIdentity) {
        delete updateUserDto.name;
        delete updateUserDto.surname;
        delete updateUserDto.birthDate;
      }
      return this.usersService.update(userId, updateUserDto);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('')
  async delete(    @GetCurrentUser('userId') userId: string) {
    return this.usersService.delete(userId);
  }
}
