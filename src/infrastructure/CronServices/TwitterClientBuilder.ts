import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ETwitterStreamEvent,
  TweetStream,
  TweetV2SingleStreamResult,
  TwitterApi,
} from 'twitter-api-v2';

@Injectable()
export class TwitterClientBuilder
  implements IAddToken, ICleanRules, ICreateStream, IBuildClient
{
  private _client: TwitterApi;
  private _stream: TweetStream<TweetV2SingleStreamResult>;
  private _actions: Promise<any>[];
  constructor(private readonly configService: ConfigService) {
    this._actions = new Array<Promise<any>>();
  }

  public AddToken(bearer?: string): ICleanRules {
    this._client = new TwitterApi(
      bearer || this.configService.get<string>('twitterBearerToken'),
    );
    return this;
  }

  public CleanRules(newRules: { tag?: string; value: string }[]) {
    this._actions.push(this._CleanRules(newRules));
    return this;
  }
  private async _CleanRules(
    newRules: { tag?: string; value: string }[],
  ): Promise<ICreateStream> {
    const rules = await this._client.v2.streamRules();
    if (rules.data?.length) {
      await this._client.v2.updateStreamRules({
        delete: { ids: rules.data.map((rule) => rule.id) },
      });
    }
    await this._client.v2.updateStreamRules({
      add: newRules,
    });

    return this;
  }

  public CreateStream(
    streamHandler: (data: TweetV2SingleStreamResult) => any,
  ): IBuildClient {
    this._actions.push(this._CreateStream(streamHandler));
    return this;
  }

  public async _CreateStream(
    streamHandler: (data: TweetV2SingleStreamResult) => any,
  ): Promise<IBuildClient> {
    this._stream = await this._client.v2.searchStream({
      'tweet.fields': ['referenced_tweets', 'author_id'],
      expansions: ['referenced_tweets.id'],
    });
    this._stream.autoReconnect = true;
    this._stream.on(ETwitterStreamEvent.Data, streamHandler);
    return this;
  }
  public async Build(): Promise<
    [TwitterApi, TweetStream<TweetV2SingleStreamResult>]
  > {
    for (const action of this._actions) {
      await action;
    }
    return [this._client, this._stream];
  }
}

interface IAddToken {
  AddToken(bearer?: string): ICleanRules;
}

interface ICleanRules {
  CleanRules(newRules: { tag?: string; value: string }[]): ICreateStream;
}

interface ICreateStream {
  CreateStream(
    streamHandler: (data: TweetV2SingleStreamResult) => any,
  ): IBuildClient;
}

interface IBuildClient {
  Build(): Promise<[TwitterApi, TweetStream<TweetV2SingleStreamResult>]>;
}
