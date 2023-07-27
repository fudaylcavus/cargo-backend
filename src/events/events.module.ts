import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChatsModule } from 'src/chats/chats.module';
import { Chat, ChatSchema } from 'src/chats/schemas/chats.schema';
import { MessagesModule } from 'src/messages/messages.module';
import { EventsGateway } from './events.gateway';

@Module({
    imports:[ChatsModule,MessagesModule,
        MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
],
  providers: [EventsGateway],
})
export class EventsModule {}