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
import { BigNumberish } from '@ethersproject/bignumber';
import { getNumVotes } from 'prop-house-communities';
import { AuctionsService } from 'src/auction/auctions.service';

@Controller()
export class CommunitiesController {
  constructor(
    private readonly communitiesService: CommunitiesService,
    private readonly auctionsService: AuctionsService
    ) { }

  @Get('communities')
  async getCommunities(): Promise<CommunityOverview[]> {
    const communities = await this.communitiesService.findAllExtended();

    // Convert some property values to numbers for backwards compatibility
    return communities.map(c => {
      c.numAuctions = Number(c.numAuctions) || 0;
      c.ethFunded = Number(c.ethFunded) || 0;
      c.numProposals = Number(c.numProposals) || 0;
      return c;
    });
  }

  @Get('communities/id/:id')
  async findOne(@Param('id') id: number): Promise<ExtendedCommunity> {
    const foundCommunity = await this.communitiesService.findOne(id);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    return buildExtendedCommunity(foundCommunity);
  }

  @Get('communities/name/:name')
  async findOneByName(@Param('name') name: string): Promise<ExtendedCommunity> {
    const foundCommunity = await this.communitiesService.findByName(name);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    return buildExtendedCommunity(foundCommunity);
  }

  @Get('0x:address')
  async findByAddress(
    @Param('address') address: string,
  ): Promise<ExtendedCommunity> {
    address = `0x${address}`
    const foundCommunity = await this.communitiesService.findByAddress(address);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    return buildExtendedCommunity(foundCommunity);
  }

  @Get('communities/votesAtBlockTag/:communityAddress/:tag/:address')
  async votesAtBlockTag(
    @Param("communityAddress") communityAddress: string,
    @Param("tag") tag: string,
    @Param("address") address: string
  ): Promise<BigNumberish> {
    const foundCommunity = await this.communitiesService.findByAddress(communityAddress);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    return this.communitiesService.votesAtBlockTag(foundCommunity, tag, address);
  }

  @Get('communities/votesForAuction/:communityAddress/:auctionId/:address')
  async votesForAuction(
    @Param("communityAddress") communityAddress: string,
    @Param("auctionId") id: number,
    @Param("address") address: string
  ): Promise<BigNumberish> {
    const foundCommunity = await this.communitiesService.findByAddress(communityAddress);
    if (!foundCommunity)
      throw new HttpException('Community not found', HttpStatus.NOT_FOUND);
    const foundAuction = await this.auctionsService.findOne(id)
    if (!foundAuction)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return this.communitiesService.votesAtBlockTag(foundCommunity, foundAuction.balanceBlockTag, address);
  }
}
