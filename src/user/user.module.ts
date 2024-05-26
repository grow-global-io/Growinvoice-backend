import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaService } from '@/prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '@/auth/auth.service';

@Module({
  imports: [PassportModule, ConfigModule.forRoot()],
  providers: [UserService, PrismaService, AuthService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
