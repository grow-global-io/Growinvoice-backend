import { Controller, Get } from '@nestjs/common';
import { TestService } from './test.service';
import { IsPublic } from '@shared/decorators/public.decorator';

@Controller('test')
export class TestController {
  constructor(private readonly testService: TestService) {}

  @IsPublic()
  @Get()
  findAll() {
    return this.testService.findAll();
  }
}
