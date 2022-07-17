import { Controller, Get, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TasksService } from 'src/infrastructure/CronServices/TestCronService';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService, private readonly configService: ConfigService) { }
    private readonly logger = new Logger(TasksService.name);
    @Get()
    getHello(): string {
        return this.appService.getHello();
    }
}
