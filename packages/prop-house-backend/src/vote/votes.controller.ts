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
import { AuctionsService } from 'src/auction/auctions.service';
import { isValidVoteDirection, VoteDirections } from 'src/utils/vote';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './vote.types';
import { VotesService } from './votes.service';
import { calcIndividualVoteWeight, VoteType } from 'src/utils/vote';
import { Proposal } from 'src/proposal/proposal.entity';

@Controller('votes')
export class VotesController {
  constructor(
    private readonly votesService: VotesService,
    private readonly proposalService: ProposalsService,
    private readonly auctionService: AuctionsService,
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

  @Get('delegated/:address')
  getDelegatedVotes(@Param('address') address: string) {
    return this.votesService.getNumDelegatedVotes(address);
  }

  @Post()
  async create(@Body() createVoteDto: CreateVoteDto) {
    const foundProposal = await this.proposalService.findOne(
      createVoteDto.proposalId,
    );

    // Verify that proposal exist
    if (!foundProposal)
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);

    // Verify that vote direction is valid
    if (!isValidVoteDirection(createVoteDto.direction))
      throw new HttpException(
        `${createVoteDto.direction} is not a valid vote direction`,
        HttpStatus.BAD_REQUEST,
      );

    // Verify that signed data equals this payload
    const signedPayload: CreateVoteDto = JSON.parse(
      Buffer.from(createVoteDto.signedData.message, 'base64').toString(),
    );
    if (
      !(
        signedPayload.direction === createVoteDto.direction &&
        signedPayload.proposalId === createVoteDto.proposalId
      )
    )
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    // Verify that signer has delegated votes
    const delegatedVotes = await this.votesService.getNumDelegatedVotes(
      createVoteDto.address,
    );
    if (delegatedVotes.votes === 0)
      throw new HttpException(
        'Signer does not have delegated votes',
        HttpStatus.BAD_REQUEST,
      );

    // Get votes by user for auction
    const signerVotesForAuction = (
      await this.votesService.findByAddress(createVoteDto.address)
    )
      .filter((vote) => vote.proposal.auctionId === foundProposal.auctionId)
      .sort((a, b) => (a.createdDate < b.createdDate ? -1 : 1));

    // Voting up
    if (createVoteDto.direction === VoteDirections.Up) {
      // Verify that user has not reached max votes
      if (signerVotesForAuction.length >= delegatedVotes.votes)
        throw new HttpException(
          'Signer has consumed all delegated votes',
          HttpStatus.BAD_REQUEST,
        );

      await this.votesService.createNewVote(
        createVoteDto,
        foundProposal,
        delegatedVotes.type,
      );

      const votes = await this.votesService.findAllByAuctionId(
        foundProposal.auctionId,
      );
      await this.proposalService.rollupScores(votes, foundProposal.auctionId);
    }

    // Voting down
    if (createVoteDto.direction === VoteDirections.Down) {
      // Verify that proposal has votes
      if (
        signerVotesForAuction.filter(
          (vote) => vote.proposalId === foundProposal.id,
        ).length === 0
      )
        throw new HttpException(
          `Signer has no votes to downvote on proposal #${foundProposal.id}`,
          HttpStatus.BAD_REQUEST,
        );

      // Delete *last* vote submitted on proposal
      await Vote.delete(
        signerVotesForAuction
          .reverse()
          .find((vote) => vote.proposalId === foundProposal.id),
      );

      const votes = await this.votesService.findAllByAuctionId(
        foundProposal.auctionId,
      );
      await this.proposalService.rollupScores(votes, foundProposal.auctionId);
    }
  }
}
