import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '@shared/models';
import { IsOptional, IsString } from 'class-validator';

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
}

export class UpdateUserCompany extends UpdateUserDto {
  old_password: string;
}
