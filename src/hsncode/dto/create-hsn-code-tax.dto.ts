import { ApiProperty } from '@nestjs/swagger';

export class CreateHSNCodeTaxDto {
  hsn_code: string;
  @ApiProperty({
    type: 'number',
    format: 'float',
  })
  tax: number;
  @ApiProperty({
    type: 'string',
  })
  user_id: string;
}
