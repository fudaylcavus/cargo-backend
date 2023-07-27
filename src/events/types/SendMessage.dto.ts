import { Socket } from "socket.io"
import { Message } from "src/messages/schemas/messsages.schema"
import { User } from "src/users/schemas/user.schema"

export class SendMessageDto {
    sender:User
    chatId:string
    message:string    
  }
  