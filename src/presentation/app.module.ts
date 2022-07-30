import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from 'src/infrastructure/CronServices/cronService.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      envFilePath: 'src/presentation/.env',
      isGlobal: true,
    }),
    CronModule,
    // ClientsModule.register([
    //   {
    //     name: 'KafkaClient',
    //     transport: Transport.KAFKA,
    //     options: {
    //       client: {
    //         clientId: 'kafkaSample',
    //         brokers: ['localhost:9092'],
    //       },
    //     },
    //   },
    // ]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
