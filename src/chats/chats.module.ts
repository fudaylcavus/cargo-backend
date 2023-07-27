import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/messages/schemas/messsages.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import {
  Chat,
  ChatSchema,
} from './schemas/chats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chat.name, schema: ChatSchema },
      {name:User.name,schema:UserSchema},
      {name:Message.name,schema:MessageSchema}
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsService],
  exports: [ChatsService],
})
export class ChatsModule {}
