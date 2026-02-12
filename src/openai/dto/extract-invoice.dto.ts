import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ExtractInvoiceDto {
  @ApiProperty({
    description:
      'Base64 strings (no data URL prefix) of invoice/receipt images',
    type: [String],
    example: ['<base64 string 1>', '<base64 string 2>'],
  })
  @IsArray()
  @IsString({ each: true })
  imageBase64: string[];
}
