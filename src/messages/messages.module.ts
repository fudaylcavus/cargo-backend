import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsModule } from 'src/chats/chats.module';
import { Chat, ChatSchema } from 'src/chats/schemas/chats.schema';
import { NotificationsModule } from 'src/notifications/notification.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { Message, MessageSchema } from './schemas/messsages.schema';

@Module({
  imports: [
    ChatsModule,
    NotificationsModule,
    MongooseModule.forFeature([
      { name: Message.name, schema: MessageSchema },

      { name: Chat.name, schema: ChatSchema },
    ]),
  ],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
