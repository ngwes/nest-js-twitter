import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2';

@Injectable()
export class TasksService {

    constructor(private readonly configService: ConfigService) { }
    private readonly logger = new Logger(TasksService.name);

    @Cron(new Date(Date.now() + 10 * 1000))
    async handleCron() {
        this.logger.debug('Cron Job HERE!');
        const client = new TwitterApi(this.configService.get<string>('twitterBearerToken'));

        const rules = await client.v2.streamRules();
        if (rules.data?.length) {
            await client.v2.updateStreamRules({
                delete: { ids: rules.data.map(rule => rule.id) },
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
        stream.on(ETwitterStreamEvent.Data, async tweet => {
            const isARt = tweet.data.referenced_tweets?.some(tweet => tweet.type === 'retweeted') ?? false;
            if (isARt) {
                return;
            }
            console.log(tweet.data?.text);
        });
    }
}