import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    getHello(toPrint: string = "Hello World!"): string {
        return toPrint;
    }
}
