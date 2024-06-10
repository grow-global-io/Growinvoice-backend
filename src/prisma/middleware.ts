import { Prisma } from '@prisma/client';

export function SoftDeleteMiddleware<T>(): Prisma.Middleware {
  return async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<T>,
  ): Promise<T> => {
    const whiteList: Prisma.ModelName[] = [];

    if (whiteList.includes(params.model)) {
      // Ignore queries for models in the white list
      return next(params);
    }

    // if (params.action === 'findFirst') {
    //   // Find unique queries
    //   // Add a condition to the query
    //   params.args['where'] = {
    //     ...params.args['where'],
    //     isExist: true,
    //   };
    // }
    // if (params.action === 'findUnique') {
    //   // Find unique queries
    //   // Add a condition to the query
    //   params.args['where'] = {
    //     ...params.args['where'],
    //     isExist: true,
    //   };
    // }

    return next(params);
  };
}
