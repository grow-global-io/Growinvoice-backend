import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConstants } from '../../src/auth/constants';
import { TokenUserDto } from '../../src/auth/dto/token-user.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: TokenUserDto) {
    if (!payload.sub) {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: payload.email,
        },
      });
      payload.sub = user.id;
    }
    console.log('JWT Payload:', payload); // Debugging line
    return payload;
  }
}
