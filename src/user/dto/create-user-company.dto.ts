import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '@shared/models';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class CreateUserCompany extends CreateUserDto {
  @ApiProperty()
  companyName: string;

  @ApiProperty({
    type: 'string',
    required: false,
    description: 'Google OAuth token for Google sign-in',
  })
  @IsOptional()
  @IsString()
  googleToken?: string;

  @ApiProperty({
    type: 'boolean',
    required: false,
    description: 'Flag to indicate this is a Google sign-in attempt',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isGoogleSignIn?: boolean;
}

export class UpdateUserCompany extends UpdateUserDto {
  old_password: string;
}
