import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunitiesController } from './community.controller';
import { Community } from './community.entity';
import { CommunitiesService } from './community.service';

@Module({
  imports: [TypeOrmModule.forFeature([Community])],
  controllers: [CommunitiesController],
  providers: [CommunitiesService],
  exports:[TypeOrmModule]
})
export class CommunitiesModule {}
