import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ParseDate } from 'src/utils/date';
import { Community } from './community.entity';
import { CommunitiesService } from './community.service';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @Get()
  getVotes(): Promise<Community[]> {
    return this.communitiesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Community> {
    const foundCommunity = await this.communitiesService.findOne(id);
    if (!foundCommunity) throw new HttpException("Community not found", HttpStatus.NOT_FOUND);
    return foundCommunity;
  }

}
