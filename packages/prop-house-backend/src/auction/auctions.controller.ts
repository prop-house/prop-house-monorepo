import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ParseDate } from 'src/utils/date';
import { Auction } from './auction.entity';
import { CreateAuctionDto, GetAuctionsDto, LatestDto } from './auction.types';
import { AuctionsService, AuctionWithProposalCount } from './auctions.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { Proposal } from 'src/proposal/proposal.entity';
import { InfiniteAuctionProposal } from 'src/proposal/infauction-proposal.entity';

@Controller('auctions')
export class AuctionsController {
  constructor(
    private readonly auctionsService: AuctionsService,
    private readonly proposalService: ProposalsService,
  ) {}

  @Get()
  getVotes(): Promise<Auction[]> {
    return this.auctionsService.findAll();
  }

  @Post()
  async create(@Body() createAuctionDto: CreateAuctionDto): Promise<Auction> {
    const auction = new Auction();
    auction.startTime = createAuctionDto.startTime
      ? ParseDate(createAuctionDto.startTime)
      : new Date();
    auction.fundingAmount = createAuctionDto.fundingAmount;
    auction.proposalEndTime = ParseDate(createAuctionDto.proposalEndTime);
    auction.votingEndTime = ParseDate(createAuctionDto.votingEndTime);
    auction.title = createAuctionDto.title;
    return this.auctionsService.store(auction);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Auction> {
    const foundAuction = await this.auctionsService.findOne(id);
    if (!foundAuction)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return foundAuction;
  }

  @Get('/forCommunity/:id')
  async findAllForCommunity(
    @Param('id') id: number,
  ): Promise<AuctionWithProposalCount[]> {
    const auctions = await this.auctionsService.findAllForCommunity(id);
    if (!auctions)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    auctions.map((a) => (a.numProposals = Number(a.numProposals) || 0));
    return auctions;
  }

  @Get('/:name/community/:id')
  async findWithNameForCommunity(
    @Param('id') id: number,
    @Param('name') name: string,
  ): Promise<Auction> {
    const auction = await this.auctionsService.findWithNameForCommunity(
      name,
      id,
    );
    if (!auction)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auction;
  }

  @Get(':id/proposals')
  async find(
    @Param('id') id: number,
  ): Promise<(Proposal | InfiniteAuctionProposal)[]> {
    const foundProposals = await this.proposalService.findAllWithAuctionId(id);
    if (!foundProposals)
      throw new HttpException('Proposals not found', HttpStatus.NOT_FOUND);
    return foundProposals;
  }
  l;

  @Get(':id/rollUpProposals')
  async findAll(
    @Param('id') id: number,
  ): Promise<(Proposal | InfiniteAuctionProposal)[]> {
    const foundProposals = await this.proposalService.findAllWithAuctionId(id);
    if (!foundProposals)
      throw new HttpException('Proposals not found', HttpStatus.NOT_FOUND);
    for (let index = 0; index < foundProposals.length; index++) {
      await this.proposalService.rollupVoteCount(foundProposals[index].id);
    }
    return foundProposals;
  }

  @Get('allActive/:n')
  async findAllActive(@Query() dto: GetAuctionsDto): Promise<Auction[]> {
    const auctions = await this.auctionsService.findAllActive(dto);
    if (!auctions)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auctions;
  }

  @Get('active/:n')
  async findAllActiveForCommunities(
    @Query() dto: GetAuctionsDto,
  ): Promise<Auction[]> {
    const auctions = await this.auctionsService.findAllActiveForCommunities(
      dto,
    );
    if (!auctions)
      throw new HttpException('Auction not found', HttpStatus.NOT_FOUND);
    return auctions;
  }

  @Get('latestNumProps/:n')
  async latestNumProps(@Query() dto: LatestDto): Promise<number> {
    const numProps = await this.auctionsService.latestNumProps(dto);
    if (numProps === undefined)
      throw new HttpException(
        `Error fetching num props for ${dto.auctionId} `,
        HttpStatus.NOT_FOUND,
      );
    return Number(numProps);
  }

  @Get('latestNumVotes/:n')
  async latestNumVotes(@Query() dto: LatestDto): Promise<number> {
    const numVotes = await this.auctionsService.latestNumVotes(dto);
    if (numVotes === undefined)
      throw new HttpException(
        `Error fetching num props for ${dto.auctionId} `,
        HttpStatus.NOT_FOUND,
      );
    return Number(numVotes);
  }
}
