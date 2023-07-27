import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CargosModule } from 'src/cargos/cargos.module';
import { DeliveriesModule } from 'src/deliveries/deliveries.module';
import { MailModule } from 'src/mail/mail.module';
import { User } from 'src/users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { ApprovalsController } from './approvals.controller';
import { ApprovalsService } from './approvals.service';
@Module({
  imports: [
    CargosModule,
    PassportModule,
    UsersModule,
    User,
    MailModule,
    DeliveriesModule,
    JwtModule.register({}),
  ],
  providers: [ApprovalsService],
  controllers: [ApprovalsController],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
