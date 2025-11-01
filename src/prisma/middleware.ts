import { Prisma } from '@prisma/client';

export function SoftDeleteMiddleware<T>(): Prisma.Middleware {
  return async (
    params: Prisma.MiddlewareParams,
    next: (params: Prisma.MiddlewareParams) => Promise<T>,
  ): Promise<T> => {
    const blackList: Prisma.ModelName[] = [
      Prisma.ModelName.Invoice,
      Prisma.ModelName.Customer,
      Prisma.ModelName.HSNCode,
      Prisma.ModelName.Product,
      Prisma.ModelName.ProductUnit,
      Prisma.ModelName.Quotation,
      Prisma.ModelName.Tax,
    ];

    if (params.model && !blackList.includes(params.model)) {
      // Ignore queries for models in the white list
      return next(params);
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
