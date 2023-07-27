import { PartialType } from '@nestjs/mapped-types';
import { CreateChatDto } from './create.chats.dto';

export class UpdateChatsDto extends PartialType(CreateChatDto) {}
