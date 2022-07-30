import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ClientKafka, Transport } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';
import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2';
@Injectable()
export class TasksService /*implements OnModuleInit */ {
  constructor(private readonly configService: ConfigService) {}
  private readonly logger = new Logger(TasksService.name);

  //TODO: refactor
  @Client({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'kafkaSample',
        brokers: ['localhost:9092'],
      },
    },
  })
  kafkaClient: ClientKafka;
  // async onModuleInit() {
  //   this.kafkaClient.subscribeToResponseOf('twitter-topic');
  //   await this.kafkaClient.connect();
  // }
  @Cron(new Date(Date.now() + 10 * 1000))
  async handleCron() {
    this.logger.debug('Cron Job HERE!');
    this.kafkaClient.subscribeToResponseOf('twitter-topic');
    await this.kafkaClient.connect();
    const client = new TwitterApi(
      this.configService.get<string>('twitterBearerToken'),
    );

    const rules = await client.v2.streamRules();
    if (rules.data?.length) {
      await client.v2.updateStreamRules({
        delete: { ids: rules.data.map((rule) => rule.id) },
      });
    }
    await client.v2.updateStreamRules({
      add: [{ value: 'JavaScript' }, { value: 'NodeJS' }],
    });

    const stream = await client.v2.searchStream({
      'tweet.fields': ['referenced_tweets', 'author_id'],
      expansions: ['referenced_tweets.id'],
    });
    stream.autoReconnect = true;
    stream.on(ETwitterStreamEvent.Data, async (tweet) => {
      const isARt =
        tweet.data.referenced_tweets?.some(
          (tweet) => tweet.type === 'retweeted',
        ) ?? false;
      if (isARt) {
        return;
      }
      this.logger.debug(tweet.data?.text);
      this.kafkaClient.send('twitter-topic', tweet.data?.text).subscribe({
        next: () => {
          this.logger.debug('sent message to kafka');
        },
      });
    });
  }
}
