import { Module } from '@nestjs/common';
import { User } from 'src/users/schemas/user.schema';
import { UsersModule } from 'src/users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';



@Module({
  imports: [
    UsersModule,
    User,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
  exports: [ProfileService],
})
export class ProfileModule {}
