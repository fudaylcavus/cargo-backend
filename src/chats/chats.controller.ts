import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import mongoose, { ObjectId } from 'mongoose';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { GetChatIdDto } from 'src/events/types/get-chatId.dto';
import { User } from 'src/users/schemas/user.schema';
import { isValidId } from 'src/util/helper-functions';
import { ChatsService } from './chats.service';
import { CreateChatDto, GetOtherUser } from './dto/create.chats.dto';
import { UpdateChatsDto } from './dto/update.chats.dto';

import { Chat, ChatDocument } from './schemas/chats.schema';

@UseGuards(JwtAuthGuard)
@Controller('api/chats')
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}
  @Post()
  async create(
    @GetCurrentUser('userId') userId: User,
    @Body() otherUser: GetOtherUser,
  ): Promise<ChatDocument> {
    console.log('check user :' + userId);
    if (userId.toString() === otherUser.toString()) {
      throw new HttpException('Users cannot be same', HttpStatus.BAD_REQUEST);
    }
    return await this.chatsService.create({ users: [userId, otherUser.user] });
  }

  @Get('find/:id')
  async findOne(@Param('id') id: string): Promise<Chat | null> {
    return this.chatsService.findOne(id);
  }

  @Get('')
  async findAll(): Promise<Chat[] | null> {
    return this.chatsService.findAll();
  }
  @Get(':id/messages')
  async getMessages(@Param('id') id: string): Promise<Chat | null> {
    return this.chatsService.findOne(id);
  }

  @Get('/user')
  async getChatsOfUser(
    @GetCurrentUser('userId') userId: string,
    @Query() query: any,
  ): Promise<Chat[] | null> {
    const { skip } = query;
    const skipVal = skip && /^\d+$/.test(skip) ? Number(skip) : 0;
    return this.chatsService.getChatsOfUser(userId, skipVal);
  }

  @Post('/getChatId')
  async getChatId(
    @Body() createChatDto: CreateChatDto,
  ): Promise<mongoose.Schema.Types.ObjectId | null> {
    return this.chatsService.getChatId(createChatDto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetCurrentUser('userId') userId: string,
  ): Promise<ChatDocument | null> {
    return await this.chatsService.delete(id, userId);
  }
}
