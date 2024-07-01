import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OpenAiHistoryUserIdQueryUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  query: string;
}

@ApiExtraModels(OpenAiHistoryUserIdQueryUniqueInputDto)
export class ConnectOpenAiHistoryDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: OpenAiHistoryUserIdQueryUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => OpenAiHistoryUserIdQueryUniqueInputDto)
  user_id_query?: OpenAiHistoryUserIdQueryUniqueInputDto;
}
