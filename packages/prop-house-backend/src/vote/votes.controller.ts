import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProposalsService } from 'src/proposal/proposals.service';
import { isValidVoteDirection } from 'src/utils/vote';
import { Vote } from './vote.entity';
import { CreateVoteDto } from './vote.types';
import { VotesService } from './votes.service';

@Controller('votes')
export class VotesController {
  constructor(
    private readonly votesService: VotesService,
    private readonly proposalService: ProposalsService,
    private readonly eventEmitter: EventEmitter2,
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
  async create(@Body() createVoteDto: CreateVoteDto): Promise<Vote> {
    const foundProposal = await this.proposalService.findOne(
      createVoteDto.proposalId,
    );
    if (!foundProposal)
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
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

    const vote = new Vote();
    vote.address = createVoteDto.address;
    vote.proposal = foundProposal;
    vote.direction = createVoteDto.direction;
    vote.signedData = createVoteDto.signedData;

    // Delete the user's old vote for this proposal
    await Vote.delete({
      address: vote.address,
      proposal: vote.proposal,
    });

    // Store the new vote
    await this.votesService.store(vote);
    // Rollup the score for the proposal
    await this.proposalService.rollupScore(foundProposal.id);
    // Return the vote _with_ the new proposal state
    return this.votesService.findOne(vote.id);
  }
}
