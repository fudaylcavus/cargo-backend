import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CargosModule } from 'src/cargos/cargos.module';
import { NotificationsModule } from 'src/notifications/notification.module';
import { Trip, TripSchema } from 'src/trips/schemas/trips.schema';
import { TripsModule } from 'src/trips/trips.module';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { DeliveriesController } from './deliveries.controller';
import { DeliveriesService } from './deliveries.service';
import {
  Delivery,
  DeliverySchema,
} from './schemas/deliveries.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Delivery.name, schema: DeliverySchema },
      {name:User.name,schema:UserSchema},
      {name:Trip.name,schema:TripSchema}
    ]),
    CargosModule,
    NotificationsModule
  ],
  controllers: [DeliveriesController],
  providers: [DeliveriesService],
  exports: [DeliveriesService],
})
export class DeliveriesModule {}
