import { Injectable } from '@nestjs/common';

@Injectable()
export class TestService {
  // Business logic to handle API requests


  findAll() {
    return 'Test API is working!';
  }
}
