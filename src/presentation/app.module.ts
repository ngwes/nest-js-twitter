import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from 'src/infrastructure/CronServices/cronService.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { CronModule } from './infrastructure/CronServices/cronService.module';

@Module({
    imports: [ScheduleModule.forRoot(), ConfigModule.forRoot({
        envFilePath: 'src/presentation/.env',
        isGlobal: true,
    }), CronModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
