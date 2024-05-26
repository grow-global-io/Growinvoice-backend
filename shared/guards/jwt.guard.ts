import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '@shared/decorator.decorator';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // 💡 See this condition
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest<TUser = any>(err: any, user: any, info: any): TUser {
    if (err) {
      // Handle specific Passport errors (e.g., JWT expired)
      if (info && info.name === 'TokenExpiredError') {
        throw new UnauthorizedException('JWT token has expired.');
      } else if (info && info.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid JWT token.');
      } else {
        // General unauthorized error
        throw new UnauthorizedException(info?.message || 'Unauthorized');
      }
    }
    if (info) throw new UnauthorizedException(info.message || 'Unauthorized');

    if (!user) {
      // Throw error if no user is provided
      throw new UnauthorizedException('No user found with this JWT token.');
    }

    return user;
  }
}
