import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Cargo, CargoSchema } from 'src/cargos/schemas/cargos.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    MongooseModule.forFeature([
      { name: Cargo.name, schema: CargoSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
})
export class ImagesModule {}
