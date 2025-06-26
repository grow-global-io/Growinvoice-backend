// src/store/dto/checkout-invoice.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsPhoneNumber,
  IsObject,
  ValidateNested,
  IsArray,
  IsNumber,
  Min,
} from 'class-validator';

// DTO for the nested 'products' array items
class ProductItemDto {
  @ApiProperty({ example: 'prod_abc123' })
  @IsString()
  @IsNotEmpty()
  product_id: string;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  total: number;

  @ApiProperty({ example: ['TAX_01'] })
  @IsArray()
  @IsString({ each: true })
  taxes: string[];

  @ApiProperty({ example: 'HSN_CODE_XYZ' })
  @IsString()
  @IsNotEmpty()
  hsnId: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  price: number;
}

// DTO for the nested 'shippingDetails' object
class ShippingDetailsDto {
  @ApiProperty({ example: '123 NestJS Ave' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'US' })
  @IsString()
  @IsNotEmpty()
  country_id: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  @IsNotEmpty()
  state_id: string;

  @ApiProperty({ example: '10001' })
  @IsString()
  @IsNotEmpty()
  zip: string;
}

// The main DTO for the request body
export class CheckoutInvoiceCreateDto {
  @ApiProperty({ description: "Customer's full name", example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Customer's email address",
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "Customer's phone number",
    example: '+15551234567',
  })
  @IsPhoneNumber() // Validates phone number format (for a specific region if needed)
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ type: () => ShippingDetailsDto })
  @IsObject()
  @ValidateNested() // <-- This is crucial for validating the nested object
  @Type(() => ShippingDetailsDto) // <-- This is crucial for transforming the plain object to the class instance
  shippingDetails: ShippingDetailsDto;

  @ApiProperty({ type: () => [ProductItemDto] })
  @IsArray()
  @ValidateNested({ each: true }) // <-- Crucial: validates each item in the array
  @Type(() => ProductItemDto) // <-- Crucial: transforms each item in the array
  products: ProductItemDto[];

  @ApiProperty({
    description: 'The ID of the user creating the invoice',
    example: 'user-xyz789',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    description: 'The currency of the transaction',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string;
}

export class CreateStoreDto {
  storeName: string;
}
