import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Make it global to ensure single instance across all modules
@Module({
  imports: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
