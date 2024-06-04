import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { CompanyModule } from './company/company.module';
import { ProductModule } from './product/product.module';
import { ProductunitModule } from './productunit/productunit.module';
import { HsncodeModule } from './hsncode/hsncode.module';
import { TaxcodeModule } from './taxcode/taxcode.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CompanyModule,
    ProductModule,
    ProductunitModule,
    HsncodeModule,
    TaxcodeModule,
  ],
  controllers: [],
  providers: [MailService],
})
export class AppModule {}
