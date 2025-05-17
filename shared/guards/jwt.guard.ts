import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return user; // Allow public route to proceed without a user
    }

    if (err) {
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token has expired.');
      } else if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid JWT token.');
      } else {
        throw new UnauthorizedException(info?.message || 'Unauthorized');
      }
    }

    if (!user) {
      throw new UnauthorizedException('No user found with this JWT token.');
    }

    return user;
  }
}
