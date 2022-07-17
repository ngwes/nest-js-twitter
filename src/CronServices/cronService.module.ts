import { Module } from '@nestjs/common';
import { TasksService } from './TestCronService';

@Module({
    exports: [],
    providers: [TasksService]
})
export class CronModule { }
