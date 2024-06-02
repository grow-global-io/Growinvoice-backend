import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@shared/decorators/public.decorator';
import { PrismaService } from '@/prisma/prisma.service';

export class JwtFullDataAuthGuard extends AuthGuard('jwtFullData') {
  constructor(private prismaService: PrismaService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Check if the route is public
    const isPublic = new Reflector().getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
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

    const request = context.switchToHttp().getRequest();

    const token = request.headers.authorization?.split('Bearer ').pop();

    if (!token) {
      // Throw error if no user is provided
      throw new UnauthorizedException('No token provided.');
    }

    if (!user) {
      throw new UnauthorizedException('No user found.');
    }

    return user;
  }
}
