import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChatsService } from 'src/chats/chats.service';
import { Chat, ChatDocument } from 'src/chats/schemas/chats.schema';
import { NotificationsService } from 'src/notifications/notifications.service';
import { CreateMessageDto } from './dto/create.message.dto';
import { UpdateMessageDto } from './dto/update.messages.dto';
import { Message, MessageDocument } from './schemas/messsages.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(Chat.name)
    private readonly chatModel: Model<ChatDocument>,
    private readonly chatService: ChatsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(messageDto: CreateMessageDto): Promise<MessageDocument> {
    let chat = await this.chatModel.findById(messageDto.chat.toString());
    if (!chat) {
      throw new HttpException('Chat is not valid', HttpStatus.BAD_REQUEST);
    }
    if (messageDto.receiver === messageDto.sender) {
      throw new HttpException('Users cannot be same', HttpStatus.BAD_REQUEST);
    }
    const createdMessage = await this.messageModel.create(messageDto);
    chat.messages = chat.messages.concat(createdMessage._id.toString());
    await this.chatService.update(messageDto.chat.toString(), chat);
    await this.notificationsService.sendChatMessageNotification({
      id: createdMessage.sender._id,
      to: createdMessage.receiver.pushToken,
      message: createdMessage.message,
    });
    return createdMessage;
  }

  async findAll(): Promise<Message[] | null> {
    return this.messageModel
      .find()
      .populate(['chat'])
      .exec()
      .catch((error) => null);
  }

  async findMessagesOfChat(
    chatId: string,
    skip: number = 0,
  ): Promise<MessageDocument[] | null> {
    const messages = await this.messageModel
      .find({ chat: chatId }, undefined, { skip, limit: 10 })
      .sort({ createdAt: -1 })
      .exec()
      .catch((error) => null);
    return messages;
  }

  async findById(id: Number): Promise<MessageDocument | null> {
    const message = await this.messageModel
      .findOne({ _id: id })
      .populate(['chat'])
      .exec()
      .catch((error) => null);

    return message;
  }

  async getAfterDate(
    date: Date,
    chatId: string,
  ): Promise<MessageDocument[] | null> {
    const message = await this.messageModel
      .find({
        chat: chatId,
        createdAt: {
          $gte: date == null ? new Date('2001-03-28') : date,
        },
      })
      .populate(['chat'])
      .exec()
      .catch((error) => null);

    return message;
  }

  async getAfterMessage(
    messageId: string,
    chatId: string,
  ): Promise<MessageDocument[] | null> {
    const messageToFilter = await this.messageModel.findOne({ _id: messageId });
    if (!messageToFilter) return null;
    const date = messageToFilter.createdAt;

    const message = await this.messageModel
      .find({
        chat: chatId,
        createdAt: {
          $gte: date == null ? new Date('2001-03-28') : date,
        },
      })
      .populate(['chat'])
      .exec()
      .catch((error) => null);

    return message;
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageDocument | null> {
    return await this.messageModel
      .findByIdAndUpdate(id, updateMessageDto, { new: true })
      .exec()
      .catch((error) => null);
  }

  async delete(id: string) {
    const deletedMessage = await this.messageModel
      .findByIdAndRemove({ _id: id })
      .exec()
      .catch((error) => null);

    return deletedMessage;
  }
}
