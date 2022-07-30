import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(toPrint = 'Hello World!'): string {
    return toPrint;
  }
}
