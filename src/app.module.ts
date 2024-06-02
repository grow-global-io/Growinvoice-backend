import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtFullDataAuthGuard } from '@shared/guards/jwtFullData.guard';
import { JwtStrategy } from '@shared/strategies/jwt.strategy';
import { JwtAuthGuard } from '@shared/guards/jwt.guard';
import { JwtFullDataStrategy } from '@shared/strategies/jwtFullData.strategy';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [],
  providers: [
    JwtStrategy,
    JwtAuthGuard,
    JwtFullDataAuthGuard,
    JwtFullDataStrategy,
    MailService,
    {
      provide: APP_GUARD,
      useClass: JwtFullDataAuthGuard,
    },
  ],
})
export class AppModule {}
