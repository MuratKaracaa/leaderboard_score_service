import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Repository } from 'typeorm';

import redisKeys from 'src/common/constants/redisKeys';

import { Score } from '../database/entities/score.entity';

@Injectable()
export class ScoreService {
  @InjectRepository(Score)
  private readonly scoreRepository: Repository<Score>;
  @InjectRedis()
  private readonly redis: Redis;

  async readFromSortedList(
    listName: string,
    start: string,
    end: string,
  ): Promise<Array<string>> {
    return await this.redis.zrevrange(listName, start, end, 'WITHSCORES');
  }

  async getRankFromSortedList(
    listName: string,
    identifier: string,
  ): Promise<number> {
    return await this.redis.zrevrank(listName, identifier);
  }

  async saveScore(
    userId: string,
    score: number,
    listName: string,
  ): Promise<void> {
    const poolRatio = 0.2;
    await this.redis
      .multi()
      .zincrby(listName, score, userId)
      .incrbyfloat(redisKeys.PRIZEPOOL, score * poolRatio)
      .exec();

    await this.scoreRepository
      .createQueryBuilder()
      .insert()
      .into(Score)
      .values({ userId: +userId, score })
      .onConflict(
        `("UserId") DO UPDATE SET "Score" = "Scores"."Score" + ${score}`,
      )
      .returning('*')
      .execute();
  }
}
