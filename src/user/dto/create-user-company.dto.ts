import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from '@shared/models';

export class CreateUserCompany extends CreateUserDto {
  @ApiProperty()
  companyName: string;

  @ApiProperty()
  password: string;
}
