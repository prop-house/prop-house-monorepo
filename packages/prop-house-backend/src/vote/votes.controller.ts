import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ProposalsService } from 'src/proposal/proposals.service';
import { isValidVoteDirection, VoteDirections } from 'src/utils/vote';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './vote.types';
import { VotesService } from './votes.service';
import { SignedPayloadValidationPipe } from 'src/entities/signed.pipe';

@Controller('votes')
export class VotesController {
  constructor(
    private readonly votesService: VotesService,
    private readonly proposalService: ProposalsService,
  ) {}

  @Get()
  getVotes(): Promise<Vote[]> {
    return this.votesService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Vote> {
    return this.votesService.findOne(id);
  }

  @Get('by/:address')
  findByAddress(@Param('address') address: string) {
    return this.votesService.findByAddress(address);
  }

  @Post()
  async create(
    @Body(SignedPayloadValidationPipe) createVoteDto: CreateVoteDto,
  ) {
    const foundProposal = await this.proposalService.findOne(
      createVoteDto.proposalId,
    );

    // Verify that proposal exist
    if (!foundProposal)
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);

    // Get corresponding vote from signed payload (bulk voting payloads may have multiple votes)
    const signedPayload: CreateVoteDto = JSON.parse(
      Buffer.from(createVoteDto.signedData.message, 'base64').toString(),
    );
    var arr = Object.keys(signedPayload).map((key) => signedPayload[key]);
    const correspondingVote = arr.find(
      (v) => v.proposalId === foundProposal.id,
    );

    // Verify that signed payload is for corresponding prop and community
    if (
      correspondingVote.proposalId !== createVoteDto.proposalId ||
      correspondingVote.communityAddress !== createVoteDto.communityAddress
    )
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    // Verify that signer has voting power
    const votingPower = await this.votesService.getNumVotes(
      createVoteDto,
      foundProposal.auction.balanceBlockTag,
    );

    if (votingPower === 0)
      throw new HttpException(
        'Signer does not have voting power',
        HttpStatus.BAD_REQUEST,
      );

    // Get votes by user for auction
    const signerVotesForAuction = (
      await this.votesService.findByAddress(createVoteDto.address)
    )
      .filter((vote) => vote.proposal.auctionId === foundProposal.auctionId)
      .sort((a, b) => (a.createdDate < b.createdDate ? -1 : 1));

    const aggVoteWeightSubmitted = signerVotesForAuction.reduce(
      (agg, current) => Number(agg) + Number(current.weight),
      0,
    );

    // Check that user won't exceed voting power by casting vote
    if (aggVoteWeightSubmitted + correspondingVote.weight >= votingPower)
      throw new HttpException(
        'Signer does not have enough voting power to cast vote',
        HttpStatus.BAD_REQUEST,
      );

    await this.votesService.createNewVote(createVoteDto, foundProposal);
    await this.proposalService.rollupVoteCount(foundProposal.id);
  }
}
