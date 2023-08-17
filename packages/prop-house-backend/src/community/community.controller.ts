import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { CommunitiesService } from './community.service';
import { CommunityOverview, ExtendedCommunity } from './community.types';
import { buildExtendedCommunity } from './community.utils';
import { AuctionsService } from '../auction/auctions.service';
import { Community } from './community.entity';

@Controller()
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly auctionsService: AuctionsService,
  ) {}

  @Get('communities')
  async getCommunities(): Promise<CommunityOverview[]> {
    const communities = await this.communitiesService.findAllExtended();

    // Convert some property values to numbers for backwards compatibility
    return communities.map((c) => {
      c.numAuctions = Number(c.numAuctions) || 0;
      c.ethFunded = Number(c.ethFunded) || 0;
      c.numProposals = Number(c.numProposals) || 0;
      return c;
    });
  }

  @Get('communities/id/:id')
  async findOne(@Param('id') id: number): Promise<Community> {
    const foundCommunity = await this.communitiesService.findOne(id);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    return foundCommunity;
  }

  @Get('communities/name/:name')
  async findOneByName(@Param('name') name: string): Promise<Community> {
    const foundCommunity = await this.communitiesService.findByName(name);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    return foundCommunity;
  }

  @Get('0x:address')
  async findByAddress(
    @Param('address') address: string,
  ): Promise<ExtendedCommunity> {
    address = `0x${address}`;
    const foundCommunity = await this.communitiesService.findByAddress(address);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    return buildExtendedCommunity(foundCommunity);
  }
}
