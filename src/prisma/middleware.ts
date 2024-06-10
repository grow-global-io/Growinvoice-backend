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
    if (params.action === 'findMany') {
      // Find unique queries
      // Add a condition to the query
      params.args['where'] = {
        ...params.args['where'],
        isExist: true,
      };
    }
    if (params.action === 'findFirst') {
      // Find unique queries
      // Add a condition to the query
      params.args['where'] = {
        ...params.args['where'],
        isExist: true,
      };
    }
    if (params.action === 'findUnique') {
      // Find unique queries
      // Add a condition to the query
      params.args['where'] = {
        ...params.args['where'],
        isExist: true,
      };
    }
    if (params.action === 'delete') {
      // Delete queries
      // Change action to an update
      params.action = 'update';
      params.args['data'] = {
        isExist: false,
      };
    }
    if (params.action === 'deleteMany') {
      // Delete many queries
      params.action = 'updateMany';
      params.args['data'] = {
        isExist: false,
      };
    }
    return next(params);
  };
}
