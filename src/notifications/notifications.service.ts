import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Expo, {
  ExpoPushErrorReceipt,
  ExpoPushMessage,
  ExpoPushSuccessTicket,
} from 'expo-server-sdk';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { SystemMessageDto } from './dto/notification-system.dto';
import { NewChatDto } from './dto/notification.new-chat.dto';
import { NewMessageDto } from './dto/notification.new-message.dto';
import { SendNotificationDto } from './dto/notification.send.dto';
import { AddTokenDto } from './dto/token.add.dto';
let expo = new Expo();

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>  ) {}

  async addToken(addTokenDto: AddTokenDto) {
    const user = await this.userModel.findOne({ _id: addTokenDto.userId });
    if (!user) {
      throw new HttpException('No user with that id!', HttpStatus.BAD_REQUEST);
    }
    user.pushToken = addTokenDto.pushToken;
    console.log('check this bs');
    console.log(user.pushToken);
    await user.save().catch(error=>console.error(error))
    return user;
  }

  async sendNewChatNotification(newChatDto: NewChatDto) {
    const user = await this.userModel.findOne({ _id: newChatDto.id });
    if (user)
      return await this.pushNotification({
        to: newChatDto.to,
        body: `${user.name} senin ile bir bağlantı kurdu!`,
      });
    else {
      throw new HttpException('No user found!', HttpStatus.BAD_REQUEST);
    }
  }

  async sendChatMessageNotification(newMessageDto:NewMessageDto) {
    const user = await this.userModel.findOne({ _id: newMessageDto.id });
    if (user)
      return await this.pushNotification({
        to: newMessageDto.to,
        body: newMessageDto.message,
      });
    else {
      throw new HttpException('No user found!', HttpStatus.BAD_REQUEST);
    }
  }

  async sendSystemNotification(systemMessageDto:SystemMessageDto) {
      return await this.pushNotification({
        to: systemMessageDto.to,
        body: systemMessageDto.message,
      })
  }

  private async pushNotification(sendNotificationDto: SendNotificationDto) {
    let messages = [];
    if(!Expo.isExpoPushToken(sendNotificationDto.to)){
      return {Error:"User has not have a valid push token!"}
    }
    messages.push({
      ...sendNotificationDto,
    });
    let chunks = expo.chunkPushNotifications(messages);
    await this.handleNotifications(chunks);
  }

  private async handleNotifications(chunks: ExpoPushMessage[][]) {
    let tickets = [];
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }
    await this.handleReceipts(tickets);
  }

  private async handleReceipts(tickets: any[]) {
    let receiptIds = [];
    for (let ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    async () => {
      for (let chunk of receiptIdChunks) {
        try {
          let receipts = (await expo.getPushNotificationReceiptsAsync(
            chunk,
          )) as any;
          console.log(receipts);

          for (let receiptId in receipts) {
            let { status, message, details } = receipts[receiptId];
            if (status === 'ok') {
              continue;
            } else if (status === 'error') {
              console.error(
                `There was an error sending a notification: ${message}`,
              );
              if (details && details.error) {
                console.error(`The error code is ${details.error}`);
              }
            }
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
  }
}
