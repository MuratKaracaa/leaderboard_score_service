import { Controller, Inject } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

import redisKeys from 'src/common/constants/redisKeys';

import { ScoreService } from './score.service';
import {
  GetScoreMapResponse,
  GetScoreMapRequest,
  SaveScoreRequest,
  SaveScoreResponse,
} from './score';

@Controller('score')
export class ScoreController {
  @Inject()
  private readonly scoreService: ScoreService;

  @GrpcMethod('ScoreService', 'SaveScore')
  async saveScore(
    data: SaveScoreRequest,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ): Promise<SaveScoreResponse> {
    await this.scoreService.saveScore(
      data.userId,
      data.score,
      redisKeys.LEADERBOARD,
    );
    return {};
  }

  @GrpcMethod('ScoreService', 'GetScoreMap')
  async getScoreMap(
    data: GetScoreMapRequest,
    metadata: Metadata,
    call: ServerUnaryCall<any, any>,
  ): Promise<GetScoreMapResponse> {
    const start = '0';
    const end = '99';
    const firstHundredFromRedis = await this.scoreService.readFromSortedList(
      redisKeys.LEADERBOARD,
      start,
      end,
    );
    const selfRankFromRedis = await this.scoreService.getRankFromSortedList(
      redisKeys.LEADERBOARD,
      data.userId,
    );
    const aroundSelfFromRedis = await this.scoreService.readFromSortedList(
      redisKeys.LEADERBOARD,
      `${+selfRankFromRedis - 3}`,
      `${+selfRankFromRedis + 2}`,
    );

    const response: GetScoreMapResponse = { scoreMap: {}, scoreMapSelf: {} };

    for (let i = 0; i < firstHundredFromRedis.length; i += 2) {
      response.scoreMap[firstHundredFromRedis[i]] = {
        score: +firstHundredFromRedis[i + 1],
        rank:
          (await this.scoreService.getRankFromSortedList(
            redisKeys.LEADERBOARD,
            firstHundredFromRedis[i],
          )) + 1,
      };
    }

    for (let i = 0; i < aroundSelfFromRedis.length; i += 2) {
      response.scoreMapSelf[aroundSelfFromRedis[i]] = {
        score: +aroundSelfFromRedis[i + 1],
        rank:
          (await this.scoreService.getRankFromSortedList(
            redisKeys.LEADERBOARD,
            aroundSelfFromRedis[i],
          )) + 1,
      };
    }

    return response;
  }
}
