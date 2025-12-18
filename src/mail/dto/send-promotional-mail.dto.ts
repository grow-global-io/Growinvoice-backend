import { IsBoolean, IsOptional, IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendPromotionalMailDto {
  @ApiProperty({ example: 'Special Offer!' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '<h1>50% Off!</h1>' })
  @IsString()
  html: string;

  @ApiProperty({ example: ['cust_123'], required: false })
  @IsOptional()
  @IsArray()
  customerIds?: string[];

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  sendToAllCustomers?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isTest?: boolean;

  @ApiProperty({
    example: [
      {
        filename: 'logo.png',
        content: 'base64string...',
        contentType: 'image/png',
        cid: 'logo@growinvoice',
      },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  attachments?: {
    filename: string;
    cid?: string;
    content: string;
    contentType: string;
  }[];
}
