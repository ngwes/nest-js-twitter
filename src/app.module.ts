import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CronModule } from './CronServices/cronService.module';

@Module({
    imports: [ScheduleModule.forRoot(), CronModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
