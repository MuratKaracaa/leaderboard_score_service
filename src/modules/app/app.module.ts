import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ScoreModule } from '../score/score.module';
import { RedisModule } from '../redis/redis.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    ScoreModule,
    DatabaseModule,
    RedisModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
