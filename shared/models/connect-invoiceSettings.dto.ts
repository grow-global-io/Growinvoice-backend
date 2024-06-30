import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceSettingsUserIdIdUniqueInputDto {
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

@ApiExtraModels(InvoiceSettingsUserIdIdUniqueInputDto)
export class ConnectInvoiceSettingsDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: InvoiceSettingsUserIdIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => InvoiceSettingsUserIdIdUniqueInputDto)
  user_id_id?: InvoiceSettingsUserIdIdUniqueInputDto;
}
