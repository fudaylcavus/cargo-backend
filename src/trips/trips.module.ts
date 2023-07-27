import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './schemas/trips.schema';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Delivery, DeliverySchema } from 'src/deliveries/schemas/deliveries.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema },
    {name:User.name,schema:UserSchema},
    {name:Delivery.name,schema:DeliverySchema}
      
    ]),
  ],
  controllers: [TripsController],
  providers: [TripsService],
  exports: [TripsService],
})
export class TripsModule {}
