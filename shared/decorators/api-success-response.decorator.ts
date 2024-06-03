import { Type, applyDecorators } from '@nestjs/common';
import {
  ApiExtraModels,
  ApiResponse,
  ApiResponseOptions,
  getSchemaPath,
} from '@nestjs/swagger';
import { SuccessResponseDto } from '../dto/success-response.dto';

export const ApiSuccessResponse = <TModel extends Type<unknown>>(
  model?: TModel,
  { status = 200, description }: { status?: number; description?: string } = {},
) => {
  const apiResponse: ApiResponseOptions = {
    status: status,
    description: description,
    schema: {
      title: model?.name
        ? `SuccessResponseOf${model?.name}`
        : 'SuccessResponse',
      allOf: [{ $ref: getSchemaPath(SuccessResponseDto) }],
    },
  };
  if (model) {
    apiResponse.schema.allOf.push({
      properties: {
        result: {
          $ref: getSchemaPath(model),
        },
      },
    });
  }
  const decorators = [ApiResponse(apiResponse)];
  if (model) {
    decorators.unshift(ApiExtraModels(() => model));
  }
  return applyDecorators(...decorators);
};
