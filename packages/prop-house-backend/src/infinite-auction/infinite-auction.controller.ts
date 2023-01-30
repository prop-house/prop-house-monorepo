import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { InfiniteAuction } from './infinite-auction.entity';
import { InfiniteAuctionService } from './infinite-auction.service';
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
}
