import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ParseDate } from 'src/utils/date';
import { Auction } from './auction.entity';
import { CreateAuctionDto } from './auction.types';
import { AuctionsService } from './auctions.service';

@Controller('auctions')
export class AuctionsController {
  constructor(private readonly auctionsService: AuctionsService) {}

  @Get()
  getVotes(): Promise<Auction[]> {
    return this.auctionsService.findAll();
  }
  
  @Post()
  async create(@Body() createAuctionDto: CreateAuctionDto): Promise<Auction> {
    const auction = new Auction();
    auction.startTime = createAuctionDto.startTime ? ParseDate(createAuctionDto.startTime) : new Date();
    auction.amountEth = createAuctionDto.amountEth;
    auction.proposalEndTime = ParseDate(createAuctionDto.proposalEndTime);
    auction.votingEndTime = ParseDate(createAuctionDto.votingEndTime);
    auction.title = createAuctionDto.title;
    return this.auctionsService.store(auction);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Auction> {
    const foundAuction = await this.auctionsService.findOne(id);
    if (!foundAuction) throw new HttpException("Auction not found", HttpStatus.NOT_FOUND);
    return foundAuction;
  }

}
