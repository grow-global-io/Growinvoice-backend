import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '@shared/models';

export class CreateUserCompany extends CreateUserDto {
  @ApiProperty()
  companyName: string;
}

export class UpdateUserCompany extends UpdateUserDto {
  old_password: string;
}
