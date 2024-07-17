import { ApiProperty } from '@nestjs/swagger';

export class RazorpayPaymentDto {
  @ApiProperty()
  id: string;
  @ApiProperty()
  amount: number;
  @ApiProperty()
  currency: string;
  @ApiProperty()
  receipt: string;
}
