import { User } from "src/users/schemas/user.schema"

export class GetChatIdDto {
    sender:User
    receiver:User
  }
  