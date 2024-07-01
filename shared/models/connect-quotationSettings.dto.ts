import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QuotationSettingsUserIdIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
  @ApiProperty({
    type: 'string',
    default: 'cuid',
  })
  @IsNotEmpty()
  @IsString()
  id: string;
}

@ApiExtraModels(QuotationSettingsUserIdIdUniqueInputDto)
export class ConnectQuotationSettingsDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: QuotationSettingsUserIdIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QuotationSettingsUserIdIdUniqueInputDto)
  user_id_id?: QuotationSettingsUserIdIdUniqueInputDto;
}
