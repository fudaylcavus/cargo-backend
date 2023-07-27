import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { CargosModule } from 'src/cargos/cargos.module';
import { Cargo, CargoSchema } from 'src/cargos/schemas/cargos.schema';
import { ChatsModule } from 'src/chats/chats.module';
import { Chat, ChatSchema } from 'src/chats/schemas/chats.schema';
import { DeliveriesModule } from 'src/deliveries/deliveries.module';
import { Delivery, DeliverySchema } from 'src/deliveries/schemas/deliveries.schema';
import { NotificationsModule } from 'src/notifications/notification.module';
import { Trip, TripSchema } from 'src/trips/schemas/trips.schema';
import { TripsModule } from 'src/trips/trips.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { RequestsController } from './requests.controller';
import { RequestsService } from './requests.service';

import {
  DeliveryRequestSchema,
  DeliveryRequest,
} from './schemas/delivery.requests.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeliveryRequest.name, schema: DeliveryRequestSchema },
      { name: Trip.name, schema: TripSchema },
      { name: Cargo.name, schema: CargoSchema },
      { name: User.name, schema: UserSchema },
      { name: Chat.name, schema: ChatSchema },

    ]),
    DeliveriesModule,
    CargosModule,
    NotificationsModule,
    TripsModule,
    ChatsModule,
  ],
  controllers: [RequestsController],

  providers: [RequestsService],

  exports: [RequestsService],
})
export class RequestsModule {}
