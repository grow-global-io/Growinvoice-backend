import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const reqLogger = new Logger('Req');
    const resLogger = new Logger('Res');
    const startTime = new Date().getTime();
    const { method, originalUrl } = req;

    if (originalUrl.endsWith('health') || originalUrl.endsWith('health/')) {
      return next();
    }

    reqLogger.log(`${method} ${originalUrl}`);

    res.on('finish', () => {
      const endTime = new Date().getTime();
      const responseTime = endTime - startTime;
      const { statusCode } = res;

      if (
        statusCode === 200 || // OK
        statusCode === 201 || // Created
        statusCode === 204 || // No Content
        statusCode === 304 // Not Modified
      ) {
        resLogger.log(
          `${method} ${originalUrl} ${statusCode} ${responseTime}ms`,
        );
      } else if (statusCode === 400 || statusCode === 401) {
        // Bad Request, Unauthorized
        resLogger.warn(
          `${method} ${originalUrl} ${statusCode} ${responseTime}ms`,
        );
      } else {
        resLogger.error(
          `${method} ${originalUrl} ${statusCode} ${responseTime}ms`,
        );
      }
    });

    next();
  }
}
