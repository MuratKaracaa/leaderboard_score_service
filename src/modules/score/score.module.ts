import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ScoreController } from './score.controller';
import { ScoreService } from './score.service';
import { Score } from '../database/entities/score.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Score])],
  controllers: [ScoreController],
  providers: [ScoreService],
})
export class ScoreModule {}
