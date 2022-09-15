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
import { AuctionsService } from 'src/auction/auctions.service';
import { SignedPayloadValidationPipe } from 'src/entities/signed.pipe';
import { Proposal } from 'src/proposal/proposal.entity';
import { CreateProposalDto, GetProposalsDto } from './proposal.types';
import { ProposalsService } from './proposals.service';

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly auctionsService: AuctionsService,
  ) {}

  @Get()
  getProposals(@Query() dto: GetProposalsDto): Promise<Proposal[]> {
    return this.proposalsService.findAll(dto.limit, dto.skip, dto.order);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Proposal> {
    const foundProposal = await this.proposalsService.findOne(id);
    if (!foundProposal)
      throw new HttpException('Proposal not found', HttpStatus.NOT_FOUND);
    return foundProposal;
  }

  @Post()
  async create(
    @Body(SignedPayloadValidationPipe) createProposalDto: CreateProposalDto,
  ): Promise<Proposal> {
    const foundAuction = await this.auctionsService.findOne(
      createProposalDto.parentAuctionId,
    );
    if (!foundAuction)
      throw new HttpException(
        'No auction with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    // Verify that signed data equals this payload
    const signedPayload: CreateProposalDto = JSON.parse(
      createProposalDto.signedData.message,
    );
    if (
      !(
        signedPayload.who === createProposalDto.who &&
        signedPayload.what === createProposalDto.what &&
        signedPayload.tldr === createProposalDto.tldr &&
        signedPayload.links === createProposalDto.links &&
        signedPayload.title === createProposalDto.title &&
        signedPayload.parentAuctionId === createProposalDto.parentAuctionId
      )
    )
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    const proposal = new Proposal();
    proposal.address = createProposalDto.address;
    proposal.who = createProposalDto.who;
    proposal.what = createProposalDto.what;
    proposal.tldr = createProposalDto.tldr;
    proposal.links = createProposalDto.links;
    proposal.title = createProposalDto.title;
    proposal.signedData = createProposalDto.signedData;
    proposal.auction = foundAuction;
    return this.proposalsService.store(proposal);
  }
}
