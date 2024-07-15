import { GateWayType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateGateWayDetailsDto {
  @ApiProperty({
    enum: GateWayType,
    required: false,
  })
  @IsOptional()
  type?: GateWayType;
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
    required: false,
  })
  @IsOptional()
  @IsString()
  user_id?: string;
  @ApiProperty({
    type: 'boolean',
    default: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
