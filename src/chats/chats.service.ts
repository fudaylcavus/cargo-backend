import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { response } from 'express';
import mongoose, { Model, ObjectId } from 'mongoose';
import { MessageDocument } from 'src/messages/schemas/messsages.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { isValidId, isValidIdList } from 'src/util/helper-functions';
import { CreateChatDto } from './dto/create.chats.dto';
import { UpdateChatsDto } from './dto/update.chats.dto';
import { Chat, ChatDocument } from './schemas/chats.schema';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name)
    private readonly chatModel: Model<ChatDocument>,
    @InjectModel(Chat.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}
  async getChatsOfUser(id: string, skip: number = 0): Promise<Chat[] | null> {
    console.log(id);
    isValidId(id);
    const user = await this.userModel.findOne({ _id: id }).populate({
      path: 'chats',
      select: '-messages',
      populate: {
        path: 'users',
        select: 'name surname',
      },
    });
    if (!user) return null;
    const chats = user.chats;
    return chats;
  }

  async getChatId(
    data: CreateChatDto,
  ): Promise<mongoose.Schema.Types.ObjectId | null> {
    console.log(data.users);
    let chat = await this.chatModel
      .findOne({
        users: { $in: [data.users[0], data.users[1]] },
      })
      .populate(['users']);

    if (!chat) {
      console.log('COULDNT FIND ONE');
      throw new HttpException('No user found', HttpStatus.BAD_REQUEST);
    }
    return chat._id;
  }

  async create(chatDto: CreateChatDto): Promise<ChatDocument> {
    const userList = [...chatDto.users];
    if (userList[0]===userList[1]) {
      throw new HttpException(
        'Users cannot send message to himself!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const duplicate = await this.chatModel
      .findOne({
        users: { $all: userList },
      })
      .populate(['users', 'messages'])
      .sort({ updatedAt: -1 });

    if (duplicate) {
      duplicate.updatedAt = new Date(Date.now());
      await duplicate.save();
      for (let user of userList) {
        if (!(await this.checkUserHasChat(user, duplicate))) {
          await this.addChatToUser(user, duplicate._id);
        }
      }
      throw new HttpException(duplicate, HttpStatus.OK);
    }



    const chat = await (
      await this.chatModel.create(chatDto)
    ).populate(['users']);

    for (let userId of userList) {
      await this.addChatToUser(userId, chat._id);
    }
    return chat;
  }

  async findAll(): Promise<Chat[]> {
    return await this.chatModel
      .find()
      .populate(['users', 'messages'])
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findOne(trackId: string): Promise<ChatDocument | null> {
    isValidId(String(trackId));
    return await this.chatModel.findOne({ trackId }).populate(['users']).exec();
  }

  async findById(id: Number): Promise<ChatDocument | null> {
    isValidId(String(id));
    return await this.chatModel
      .findOne({ _id: id })
      .populate(['owner', 'carrier'])
      .exec();
  }
  async update(
    id: string,
    updateChatsDto: UpdateChatsDto,
  ): Promise<ChatDocument | null> {
    isValidId(id);
    return await this.chatModel
      .findByIdAndUpdate(id, updateChatsDto, { new: true })
      .exec();
  }

  async delete(id: string, userId: string) {
    isValidIdList([id, userId]);
    const chat = await this.chatModel.findOne({ _id: id }).populate('messages');
    if (!chat) return null;
    const user = await this.userModel.findById(userId);
    if (!user) throw new HttpException('User not found', 404);
    user.chats = user.chats.filter(
      (element) => element._id.toString() !== chat._id.toString(),
    );
    await user.save();
    return chat;
  }

  async addChatToUser(userId: User, chatId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new HttpException('Couldnt find user!', 404);
    }
    const chat = await this.chatModel.findById(chatId);
    if (!chat) {
      throw new HttpException('Couldnt find chat!', 404);
    }

    user.chats = user.chats.concat(chat._id);

    await user.save();
  }

  async checkUserHasChat(userId: User, chat: Chat): Promise<Boolean> {
    const user = await this.userModel.findById(userId);
    if (!user) return false;
    return user.chats.some(
      (element) => element._id.toString() === chat._id.toString(),
    );
  }
}
