import { Injectable } from '@nestjs/common';

@Injectable()
export class CatsService {
  getCats(): string {
    console.log('hello cat');
    return 'hello cat';
  }
}
