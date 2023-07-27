import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Cargo, CargoSchema } from './schemas/cargos.schema';
import { CargosService } from './cargos.service';
import { CargosController } from './cargos.controller';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { ImagesModule } from 'src/images/images.module';
import { MulterModule } from '@nestjs/platform-express';
import { Delivery, DeliverySchema } from 'src/deliveries/schemas/deliveries.schema';
import { RequestsModule } from '../requests/requests.module';

@Module({
  imports: [
    MulterModule.register({ dest: './uploads' }),
    MongooseModule.forFeature([{ name: Cargo.name, schema: CargoSchema },
      { name: User.name, schema: UserSchema },
      { name: Delivery.name, schema: DeliverySchema }
    ]),
    
    ImagesModule
  ],
  controllers: [CargosController],
  providers: [CargosService],
  exports: [CargosService],
})
export class CargosModule {}
