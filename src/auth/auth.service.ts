import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async findUserById(id: string) {
    return this.prismaService.user.findUnique({
      where: {
        id,
      },
    });
  }
}
