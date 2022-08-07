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
      provide: 'MessageQueueClient',
      useFactory: (configService: ConfigService) => {
        const options: ClientOptions = {
          transport:
            Transport[configService.get<string>('transportType').toUpperCase()],
          options: {
            client: {
              clientId: configService.get<string>('MessageQueueClientId'),
              brokers: [configService.get<string>('MessageQueueBroker')],
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
