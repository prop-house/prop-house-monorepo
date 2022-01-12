import { Module } from '@nestjs/common';
import { VotesModule } from './votes.module';
import { VotesService } from './votes.service';

@Module({
  imports: [VotesModule],
  providers: [VotesService],
  controllers: []
})
export class VotesHttpModule {}
