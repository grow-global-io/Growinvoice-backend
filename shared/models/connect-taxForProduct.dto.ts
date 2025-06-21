import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TaxForProductProductIdTaxIdUniqueInputDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  product_id: string;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  tax_id: string;
}

@ApiExtraModels(TaxForProductProductIdTaxIdUniqueInputDto)
export class ConnectTaxForProductDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: TaxForProductProductIdTaxIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TaxForProductProductIdTaxIdUniqueInputDto)
  product_id_tax_id?: TaxForProductProductIdTaxIdUniqueInputDto;
}
