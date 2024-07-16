import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CursorPaginatedDto } from '../dto/cursor-paginated.dto';

export const ApiCursorPaginatedResponse = <TModel extends Type<unknown>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiExtraModels(() => model),
    ApiOkResponse({
      schema: {
        title: `CursorPaginatedResponseOf${model.name}`,
        allOf: [
          { $ref: getSchemaPath(CursorPaginatedDto) },
          {
            properties: {
              results: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
};
