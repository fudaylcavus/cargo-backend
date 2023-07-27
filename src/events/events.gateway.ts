import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Model } from 'mongoose';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { ChatsService } from 'src/chats/chats.service';
import { CreateChatDto } from 'src/chats/dto/create.chats.dto';
import { Chat, ChatDocument } from 'src/chats/schemas/chats.schema';
import { MessagesService } from 'src/messages/messages.service';
import { GetChatIdDto } from './types/get-chatId.dto';
import { JoinRoomDto } from './types/joinroom.dto';
import { SendMessageDto } from './types/SendMessage.dto';

const chats = new Map();
const sockets = new Map();

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  constructor(
    private readonly chatsService: ChatsService,
    @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
    private readonly messageService: MessagesService,
  ) {}
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-chat')
  async createChat(
    @MessageBody() data: CreateChatDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('CHECKKK');
    console.log(data);
    const chat = await this.chatsService.create(data);
    client.join(chat._id.toString());
    client.emit('CREATED');
  }

  @SubscribeMessage('get-chatId')
  async getChatId(
    @MessageBody() data: GetChatIdDto,
    @ConnectedSocket() client: Socket,
  ) {
    let chat = await this.chatModel.findOne({
      users: { $in: [data.sender, data.receiver] },
    });

    if (!chat) {
      console.log('COULDNT FIND ONE');
      throw new HttpException(
        'You should join chat before sending message',
        HttpStatus.BAD_REQUEST,
      );
    }

    client.emit('chat-id', chat._id.toString());
  }

  @SubscribeMessage('join-chat')
  async joinChat(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('LOG JOINED');
    console.log('DATA');
    console.log(data);
    const chat = await this.chatModel
      .findOne({ _id: data.chatId })
      .populate('messages')
      .exec();
    if (!chat) {
      console.error('ERROR NO CHAT TO JOIN');
      throw new HttpException(
        'Chat that trying to join is not found!',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('JOINED ID');
    console.log(data.chatId);
    client.join(data.chatId);
  }

  @SubscribeMessage('get-messages')
  async getMessages(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    console.log('LOG JOINED');
    console.log(client);
    const chat = await this.chatModel
      .findOne({ _id: data.chatId })
      .populate('messages')
      .exec();
    if (!chat) {
      console.error('ERROR NO CHAT TO JOIN');
      throw new HttpException(
        'No chat found with that id',
        HttpStatus.BAD_REQUEST,
      );
    }
    console.log('GET MESSAGE FROM TO ID');
    console.log(data.chatId);
    console.log('SENDING MESSAGES');
    client.emit('messages', chat.messages);
  }

  @SubscribeMessage('send-message')
  async sendMessage(
    @MessageBody() data: SendMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.sender) {
      console.error('ERROR NO SENDER ');
      throw new HttpException(
        'No sender found in request',
        HttpStatus.BAD_REQUEST,
      );
    }
    let chat = await this.chatModel.findOne({ _id: data.chatId });

    if (!chat) {
      console.log('COULDNT FIND ONE');
      throw new HttpException(
        'There is no chat with that id',
        HttpStatus.BAD_REQUEST,
      );
    }
    const chatId = chat._id.toString();
    client.to(chatId).emit('message', data);
    const receiver = chat.users.filter((element) => element != data.sender)[0];
    console.log('CHAT USERSS');
    console.log(chat.users);
    console.log('RECEIVERRR');
    console.log(receiver);
    chat.lastMessage = data.message;
    await chat.save();
    const messageToSave = {
      chat: chatId,
      message: data.message,
      sender: data.sender,
      receiver,
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    };
    await this.messageService.create(messageToSave!);
    console.log('CHAT IDD TO SENT ID');
    console.log(chatId);
    for (let user of chat.users) {
      if (!(await this.chatsService.checkUserHasChat(user, chat._id)))
        await this.chatsService.addChatToUser(user, chat._id);
    }
  }
}
