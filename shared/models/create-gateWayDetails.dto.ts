import { GateWayType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateGateWayDetailsDto {
  @ApiProperty({
    enum: GateWayType,
  })
  @IsNotEmpty()
  type: GateWayType;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  key?: string | null;
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  secret?: string | null;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
  @ApiProperty({
    type: 'boolean',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
