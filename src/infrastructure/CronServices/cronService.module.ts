import { Module } from '@nestjs/common';
import { TwitterCronJob } from './TwitterCronJob';
import { ConfigService } from '@nestjs/config';
import {
  ClientOptions,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';

@Module({
  exports: [],
  providers: [
    TwitterCronJob,
    {
      provide: 'KafkaClient',
      useFactory: (configService: ConfigService) => {
        const options: ClientOptions = {
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'kafkaId',
              brokers: [configService.get<string>('kafkaBroker')],
            },
          },
        };
        return ClientProxyFactory.create(options);
      },
      inject: [ConfigService],
    },
  ],
})
export class CronModule {}
