import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { InfiniteAuction } from './infinite-auction.entity';
import {
  InfiniteAuctionService,
  InfiniteAuctionWithProposalCount,
} from './infinite-auction.service';
import { GetInfiniteAuctionsDto } from './infinite-auction.types';

@Controller('infinite-auctions')
export class InfiniteAuctionController {
  constructor(
    private readonly infiniteAuctionsService: InfiniteAuctionService,
  ) {}

  @Get()
  getProposals(
    @Query() dto: GetInfiniteAuctionsDto,
  ): Promise<InfiniteAuction[]> {
    return this.infiniteAuctionsService.findAll(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<InfiniteAuction> {
    const foundInfiniteAuction = await this.infiniteAuctionsService.findOne(id);
    if (!foundInfiniteAuction)
      throw new HttpException('Infinite round not found', HttpStatus.NOT_FOUND);
    return foundInfiniteAuction;
  }

  @Get('/forCommunity/:id')
  async findAllForCommunity(
    @Param('id') id: number,
  ): Promise<InfiniteAuctionWithProposalCount[]> {
    const auctions = await this.infiniteAuctionsService.findAllForCommunity(id);
    if (!auctions)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    auctions.map((a) => (a.numProposals = Number(a.numProposals) || 0));
    return auctions;
  }

  @Get('/:name/community/:id')
  async findWithNameForCommunity(
    @Param('id') id: number,
    @Param('name') name: string,
  ): Promise<InfiniteAuction> {
    const auction = await this.infiniteAuctionsService.findWithNameForCommunity(
      name,
      id,
    );
    if (!auction)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auction;
  }
}
