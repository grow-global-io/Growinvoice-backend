import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '@/auth/auth.service';
import { MailService } from '@/mail/mail.service';
import { SharedService } from '@/shared/shared.service';

@Module({
  imports: [PassportModule, ConfigModule.forRoot()],
  providers: [UserService, AuthService, MailService, SharedService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
