import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cargo, CargoSchema } from 'src/cargos/schemas/cargos.schema';
import { Trip, TripSchema } from 'src/trips/schemas/trips.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Cargo.name, schema: CargoSchema }]),
    MongooseModule.forFeature([{ name: Trip.name, schema: TripSchema }]),
  ],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
