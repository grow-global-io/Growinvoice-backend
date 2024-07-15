import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GateWayType } from '@prisma/client';

export class GateWayDetailsTypeUserIdUniqueInputDto {
  @ApiProperty({
    enum: GateWayType,
  })
  @IsNotEmpty()
  type: GateWayType;
  @ApiProperty({
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  user_id: string;
}

@ApiExtraModels(GateWayDetailsTypeUserIdUniqueInputDto)
export class ConnectGateWayDetailsDto {
  @ApiProperty({
    type: 'string',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsString()
  id?: string;
  @ApiProperty({
    type: GateWayDetailsTypeUserIdUniqueInputDto,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => GateWayDetailsTypeUserIdUniqueInputDto)
  type_user_id?: GateWayDetailsTypeUserIdUniqueInputDto;
}
