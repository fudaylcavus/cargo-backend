import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CargosModule } from './cargos/cargos.module';
import { DeliveriesModule } from './deliveries/deliveries.module';
import { SearchModule } from './search/search.module';
import { ProfileModule } from './profile/profile.module';
import { TripsModule } from './trips/trips.module';
import { IsBadge } from './users/custom-validators/isBadgeValid';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { MessagesModule } from './messages/messages.module';
import { EventsModule } from './events/events.module';
import { RequestsModule } from './requests/requests.module';
import { isValidRequest } from './requests/custom-validators/isValidRequest';
import { ImagesModule } from './images/images.module';
import { ApprovalsModule } from './approvals/approvals.module';
import {  IsValidPushToken } from './notifications/validator/isValidPushToken';
import { NotificationsModule } from './notifications/notification.module';
import { IsType } from './approvals/custom-validators/isTypeValıd';
import { IsTrackId } from './users/custom-validators/isTrackIdValid';
const mongoUrl = process.env.DATABASE_URL;
if (!mongoUrl) throw new Error('NO DATABASE URL HAS BEEN PROVIDED AS ENV VARIABLE');
@Module({
  imports: [
    AuthModule,
    UsersModule,
    CargosModule,
    TripsModule,
    DeliveriesModule,
    ProfileModule,
    SearchModule,
    ChatsModule,
    ImagesModule,
    MessagesModule,
    EventsModule,
    ApprovalsModule,
    NotificationsModule,
    RequestsModule,
    MongooseModule.forRoot(mongoUrl),
  ],
  controllers: [AppController],
  providers: [AppService, IsBadge, IsType,IsValidPushToken,isValidRequest,IsTrackId],
})
export class AppModule {}
