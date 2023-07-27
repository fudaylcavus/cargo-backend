import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from 'src/users/users.module'; 
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';

@Module({
    imports:[
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
],
controllers: [NotificationsController],
providers: [NotificationsService],
exports: [NotificationsService],

})
export class NotificationsModule {}