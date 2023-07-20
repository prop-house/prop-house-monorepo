import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AuctionsService } from 'src/auction/auctions.service';
import { ECDSASignedPayloadValidationPipe } from 'src/entities/ecdsa-signed.pipe';
import { InfiniteAuctionService } from 'src/infinite-auction/infinite-auction.service';
import { canSubmitProposals } from 'src/utils';
import { InfiniteAuctionProposal } from './infauction-proposal.entity';
import { Proposal } from './proposal.entity';
import {
  CreateInfiniteAuctionProposalDto,
  CreateProposalDto,
  DeleteProposalDto,
  GetProposalsDto,
  UpdateProposalDto,
} from './proposal.types';
import { ProposalsService } from './proposals.service';
import { _execStrategy } from 'src/utils/execStrategy';

@Controller('proposals')
export class ProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly auctionsService: AuctionsService,
    private readonly infiniteAuctionsService: InfiniteAuctionService,
  ) {}

  @Get()
  getProposals(
    @Query() dto: GetProposalsDto,
  ): Promise<(Proposal | InfiniteAuctionProposal)[]> {
    return this.proposalsService.findAll(dto);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
  ): Promise<Proposal | InfiniteAuctionProposal> {
    const foundProposal = await this.proposalsService.findOne(id);
    if (!foundProposal)
      throw new HttpException('Proposal not found', HttpStatus.NOT_FOUND);
    return foundProposal;
  }

  @Delete()
  async delete(
    @Body(ECDSASignedPayloadValidationPipe)
    deleteProposalDto: DeleteProposalDto,
  ) {
    const foundProposal = await this.proposalsService.findOne(
      deleteProposalDto.id,
    );
    if (!foundProposal)
      throw new HttpException(
        'No proposal with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    if (!canSubmitProposals(await foundProposal.auction))
      throw new HttpException(
        'You cannot delete proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    // Check that signed payload and body have same proposal ID
    const signedPayload = JSON.parse(
      Buffer.from(deleteProposalDto.signedData.message, 'base64').toString(),
    );

    if (signedPayload.id !== deleteProposalDto.id)
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    if (deleteProposalDto.address !== foundProposal.address)
      throw new HttpException(
        "Found proposal does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );

    return await this.proposalsService.remove(deleteProposalDto.id);
  }

  @Patch()
  async update(
    @Body(ECDSASignedPayloadValidationPipe)
    updateProposalDto: UpdateProposalDto,
  ): Promise<Proposal | InfiniteAuctionProposal> {
    const foundProposal = await this.proposalsService.findOne(
      updateProposalDto.id,
    );
    if (!foundProposal)
      throw new HttpException(
        'No proposal with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    if (!canSubmitProposals(await foundProposal.auction))
      throw new HttpException(
        'You cannot edit proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    // Verify that signed data equals this payload
    const signedPayload = JSON.parse(
      Buffer.from(updateProposalDto.signedData.message, 'base64').toString(),
    );

    if (
      !(
        signedPayload.what === updateProposalDto.what &&
        signedPayload.tldr === updateProposalDto.tldr &&
        signedPayload.title === updateProposalDto.title &&
        signedPayload.parentAuctionId === updateProposalDto.parentAuctionId &&
        signedPayload.id === updateProposalDto.id
      )
    )
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    if (updateProposalDto.address !== foundProposal.address)
      throw new HttpException(
        "Found proposal does not match signed payload's address",
        HttpStatus.BAD_REQUEST,
      );

    foundProposal.address = updateProposalDto.address;
    foundProposal.signatureState = updateProposalDto.signatureState;
    foundProposal.what = updateProposalDto.what;
    foundProposal.tldr = updateProposalDto.tldr;
    foundProposal.title = updateProposalDto.title;
    foundProposal.signedData = updateProposalDto.signedData;
    foundProposal.reqAmount = updateProposalDto.reqAmount
      ? updateProposalDto.reqAmount
      : null;
    return this.proposalsService.store(foundProposal);
  }

  @Post()
  async create(
    @Body(ECDSASignedPayloadValidationPipe)
    createProposalDto: CreateProposalDto | CreateInfiniteAuctionProposalDto,
  ): Promise<Proposal | InfiniteAuctionProposal> {
    const foundAuction = await (createProposalDto.parentType === 'auction'
      ? this.auctionsService
      : this.infiniteAuctionsService
    ).findOne(createProposalDto.parentAuctionId);
    if (!foundAuction)
      throw new HttpException(
        'No auction with that ID exists',
        HttpStatus.NOT_FOUND,
      );

    if (!canSubmitProposals(foundAuction))
      throw new HttpException(
        'You cannot edit proposals for this round at this time',
        HttpStatus.BAD_REQUEST,
      );

    const meetsReqToSubmit = await _execStrategy(
      createProposalDto.address,
      foundAuction,
    );
    if (!meetsReqToSubmit)
      throw new HttpException(
        'You meet the requierements to submit a proposal',
        HttpStatus.BAD_REQUEST,
      );

    // Verify that signed data equals this payload
    const signedPayload = JSON.parse(
      Buffer.from(createProposalDto.signedData.message, 'base64').toString(),
    );

    if (
      !(
        signedPayload.what === createProposalDto.what &&
        signedPayload.tldr === createProposalDto.tldr &&
        signedPayload.title === createProposalDto.title &&
        signedPayload.parentAuctionId === createProposalDto.parentAuctionId
      ) ||
      (createProposalDto.parentType === 'infinite-auction' &&
        signedPayload.reqAmount !==
          (createProposalDto as CreateInfiniteAuctionProposalDto).reqAmount)
    )
      throw new HttpException(
        "Signed payload and supplied data doesn't match",
        HttpStatus.BAD_REQUEST,
      );

    const proposal =
      createProposalDto.parentType === 'auction'
        ? new Proposal()
        : new InfiniteAuctionProposal();
    proposal.address = createProposalDto.address;
    proposal.signatureState = createProposalDto.signatureState;
    proposal.what = createProposalDto.what;
    proposal.tldr = createProposalDto.tldr;
    proposal.title = createProposalDto.title;
    proposal.signedData = createProposalDto.signedData;
    proposal.auction = foundAuction;
    proposal.messageTypes = createProposalDto.messageTypes;
    proposal.domainSeparator = createProposalDto.domainSeparator;
    proposal.parentType = createProposalDto.parentType;
    proposal.createdDate = new Date();

    if (createProposalDto.parentType === 'infinite-auction') {
      proposal.reqAmount = (
        createProposalDto as CreateInfiniteAuctionProposalDto
      ).reqAmount;
    }

    return this.proposalsService.store(proposal);
  }
}
