import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  email: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  name?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  phone?: string | null;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  password: string;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  storeName?: string | null;
  @ApiProperty({
    type: 'boolean',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
  @ApiProperty({
    type: 'boolean',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  currency_id?: string | null;
}
