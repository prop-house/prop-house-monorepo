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
import { ProposalsService } from '../proposal/proposals.service';
import { verifySignedPayload } from '../utils/verifySignedPayload';
import { Vote } from './vote.entity';
import { CreateVoteDto, GetVoteDto } from './vote.types';
import { VotesService } from './votes.service';
import { SignedPayloadValidationPipe } from '../entities/signed.pipe';
import { AuctionsService } from '../auction/auctions.service';
import { SignatureState } from '../types/signature';
import { InfiniteAuctionService } from '../infinite-auction/infinite-auction.service';
import { _execStrategy } from '../utils/execStrategy';

@Controller('votes')
export class VotesController {
  constructor(
    private readonly votesService: VotesService,
    private readonly proposalService: ProposalsService,
    private readonly auctionService: AuctionsService,
    private readonly infiniteAuctionService: InfiniteAuctionService,
  ) {}

  @Get()
  getVotes(): Promise<Vote[]> {
    return this.votesService.findAll();
  }

  @Get('findWithOpts')
  getVotesWithOpts(@Query() dto: GetVoteDto): Promise<Vote[]> {
    return this.votesService.findAllWithOpts(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Vote> {
    return this.votesService.findOne(id);
  }

  @Get('by/:address')
  findByAddress(@Param('address') address: string) {
    return this.votesService.findByAddress(address);
  }

  @Get('numVotes/:account/:roundId')
  numVotesCasted(
    @Param('account') account: string,
    @Param('roundId') roundId: number,
  ) {
    return this.votesService.getNumVotesByAccountAndRoundId(account, roundId);
  }

  @Get('byCommunities/:addresses')
  findByCommunity(@Param('addresses') addresses: string) {
    const votes = this.votesService.findAllByCommunityAddresses(
      addresses.split(','),
    );
    if (!votes)
      throw new HttpException('Votes not found', HttpStatus.NOT_FOUND);
    return votes;
  }

  /**
   * Checks:
   * - signature is valid via `SignedPayloadValidationPipe`
   * - proposal being voted on exists
   * - signature matches dto
   * - proposal being voted for matches signed vote community address
   * - signer has voting power for signed vote
   * - casting vote does not exceed > voting power
   * @param createVoteDto
   */
  @Post()
  async create(
    @Body(SignedPayloadValidationPipe) createVoteDto: CreateVoteDto,
  ) {
    const foundProposal = await this.proposalService.findOne(
      createVoteDto.proposalId,
    );

    // Verify that proposal exist
    if (!foundProposal) {
      throw new HttpException('No Proposal with that ID', HttpStatus.NOT_FOUND);
    }

    // Verify signed payload against dto
    const voteFromPayload = verifySignedPayload(createVoteDto, foundProposal);

    // Protect against casting same vote twice
    const sameBlockVote = await this.votesService.findBy(
      voteFromPayload.blockHeight,
      createVoteDto.proposalId,
      createVoteDto.address,
    );
    if (sameBlockVote)
      throw new HttpException(
        `Vote for prop ${foundProposal.id} has already been casted for block number ${voteFromPayload.blockHeight}`,
        HttpStatus.FORBIDDEN,
      );

    // Verify that prop being voted on matches community address of signed vote
    const foundProposalAuction = await (foundProposal.parentType === 'auction'
      ? this.auctionService
      : this.infiniteAuctionService
    ).findOneWithCommunity(foundProposal.auctionId);
    if (
      voteFromPayload.communityAddress !==
      foundProposalAuction.community.contractAddress
    )
      throw new HttpException(
        'Proposal being voted on does not match community contract address of vote',
        HttpStatus.BAD_REQUEST,
      );

    // verify that inf-auction proposals are within their round's voting period
    if (
      foundProposal.parentType === 'infinite-auction' &&
      'votingPeriod' in foundProposalAuction
    ) {
      const expirationTimeMs =
        foundProposal.createdDate.getTime() +
        foundProposalAuction.votingPeriod * 1000;
      const isActive = expirationTimeMs > Date.now();

      if (!isActive)
        throw new HttpException(
          'Votes are being casted outisde of round voting period',
          HttpStatus.BAD_REQUEST,
        );
    }

    // Verify that signer has voting power
    const votingPower = await _execStrategy(
      createVoteDto.address,
      foundProposalAuction,
      'voteStrategy',
    );

    if (votingPower === 0) {
      throw new HttpException(
        'Signer does not have voting power',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Get votes by user for auction
    const validatedSignerVotes = await this.votesService.findByAddress(
      createVoteDto.address,
      {
        signatureState: SignatureState.VALIDATED,
      },
    );

    const signerVotesForAuction = validatedSignerVotes
      .filter((vote) => vote.proposal.auctionId === foundProposal.auctionId)
      .sort((a, b) => (a.createdDate < b.createdDate ? -1 : 1));

    const signerVotesForProp = validatedSignerVotes
      .filter((vote) => vote.proposalId === foundProposal.id)
      .sort((a, b) => (a.createdDate < b.createdDate ? -1 : 1));

    const aggVoteWeightSubmitted = (
      foundProposal.parentType === 'auction'
        ? signerVotesForAuction
        : signerVotesForProp
    ).reduce((agg, current) => Number(agg) + Number(current.weight), 0);

    // Check that user won't exceed voting power by casting vote
    if (aggVoteWeightSubmitted + voteFromPayload.weight > votingPower) {
      throw new HttpException(
        'Signer does not have enough voting power to cast vote',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.votesService.createNewVote(createVoteDto, foundProposal);

    // Only increase proposal vote count if the signature has been validated
    if (createVoteDto.signatureState === SignatureState.VALIDATED) {
      await this.proposalService.rollupVoteCount(foundProposal.id);
    }
  }
}
