import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { Cron } from '@nestjs/schedule';

import { TwitterClientBuilder } from './TwitterClientBuilder';
import { TweetV2SingleStreamResult } from 'twitter-api-v2';
@Injectable()
export class TwitterCronJob {
  constructor(
    @Inject('MessageQueueClient') private messageQueueClient: ClientKafka,
    private readonly configService: ConfigService,
  ) {}
  private readonly logger = new Logger(TwitterCronJob.name);

  @Cron(new Date(Date.now() + 10 * 1000))
  async handleCron() {
    this.logger.debug('Cron Job HERE!');
    const twitterTopic = this.configService.get<string>('twitterTopic');
    this.messageQueueClient.subscribeToResponseOf(twitterTopic);
    await this.messageQueueClient.connect();
    const hashtags = this._GetHashtags();
    const [client, stream] = await new TwitterClientBuilder(this.configService)
      .AddToken()
      .CleanRules(hashtags)
      .CreateStream(async (tweet) => {
        this._StreamHandler(tweet, twitterTopic);
      })
      .Build();
  }

  private _StreamHandler(
    tweet: TweetV2SingleStreamResult,
    twitterTopic: string,
  ) {
    if (this._IsARetweet(tweet)) return;

    this.logger.debug(tweet.data?.text);
    this.messageQueueClient.send(twitterTopic, tweet.data?.text).subscribe();
  }

  private _GetHashtags(): { tag?: string; value: string }[] {
    const x = this.configService
      .get<string>('hashtags')
      .split(this.configService.get<string>('hashtagsSeparator'));
    return x.map((v) => {
      return { value: v };
    });
  }

  private _IsARetweet(tweet: TweetV2SingleStreamResult) {
    return (
      tweet.data.referenced_tweets?.some(
        (tweet) => tweet.type === 'retweeted',
      ) ?? false
    );
  }
}
