import { Injectable, Logger } from '@nestjs/common';
import { VotesService } from 'src/vote/votes.service';
import { AuctionsService } from 'src/auction/auctions.service';
import { ProposalsService } from 'src/proposal/proposals.service';
import { SignatureState } from 'src/types/signature';
import config from 'src/config/configuration';
import { Interval } from '@nestjs/schedule';
import { verifyContractSignature } from 'src/utils';
import { Vote } from 'src/vote/vote.entity';
import { providers } from 'ethers';
import { CreateVoteDto } from 'src/vote/vote.types';

@Injectable()
export class EIP1271SignatureValidationTaskService {
  private static readonly _EVERY_15_MINUTES = 60 * 15 * 1000;

  private readonly _logger = new Logger(
    EIP1271SignatureValidationTaskService.name,
  );
  private readonly _provider = new providers.JsonRpcProvider(config().JSONRPC);

  constructor(
    private readonly _votesService: VotesService,
    private readonly _auctionsService: AuctionsService,
    private readonly _proposalService: ProposalsService,
  ) {}

  @Interval(EIP1271SignatureValidationTaskService._EVERY_15_MINUTES)
  async validatePendingSignatures() {
    const votesPendingValidation = await this._votesService.findAll({
      where: {
        signatureState: SignatureState.PENDING_VALIDATION,
      },
    });
    if (!votesPendingValidation?.length) {
      this._logger.log('No contract signatures pending validation. Exiting...');
      return;
    }

    for (const vote of votesPendingValidation) {
      try {
        // Mark the signature as invalid if the signer is not a contract
        const code = await this._provider.getCode(vote.address);
        if (code === '0x') {
          await this._votesService.store({
            ...vote,
            signatureState: SignatureState.FAILED_VALIDATION,
          });
          this._logger.log(
            `Contract signature submitted by non-contract (${vote.address}). Marking as invalid...`,
          );
          continue;
        }

        // Mark the signature as invalid if the auction vote period has elapsed
        const auction = await this._auctionsService.findOne(vote.auctionId);
        if (new Date() > auction.votingEndTime) {
          await this._votesService.store({
            ...vote,
            signatureState: SignatureState.FAILED_VALIDATION,
          });
          this._logger.log(
            `Contract signature submitted too late (${vote.address}). Marking as invalid...`,
          );
          continue;
        }

        // Mark the signature as invalid if the voter does not have enough votes remaining
        const hasEnoughVotesRemaining = await this.hasEnoughVotingPower(vote);
        if (!hasEnoughVotesRemaining) {
          await this._votesService.store({
            ...vote,
            signatureState: SignatureState.FAILED_VALIDATION,
          });
          this._logger.log(
            `Contract signature submitted has no more voting power (${vote.address}). Marking as invalid...`,
          );
          continue;
        }

        // prettier-ignore
        const message = Buffer.from(vote.signedData.message, 'base64').toString();
        // prettier-ignore
        const { isValidContractSig, contractSigError } = await verifyContractSignature(
          message,
          vote,
          this._provider,
        );
        if (!isValidContractSig) {
          this._logger.log(
            `Contract signature validation failed with error: ${contractSigError}. (${vote.address}). Retrying later...`,
          );
          continue;
        }

        await this._votesService.store({
          ...vote,
          signatureState: SignatureState.VALIDATED,
        });
        await this._proposalService.rollupVoteCount(vote.proposalId);
      } catch (error) {
        this._logger.log(
          `Contract signature validation failed with error: ${error}. Retrying later...`,
        );
      }
    }
  }

  /**
   * Determine if the voter has enough remaining voting power for the provided `vote`
   * @param vote The vote information
   */
  private async hasEnoughVotingPower(vote: Vote) {
    const proposal = await this._proposalService.findOne(vote.proposalId);

    const signedPayload: CreateVoteDto = JSON.parse(
      Buffer.from(vote.signedData.message, 'base64').toString(),
    );
    const arr = Object.keys(signedPayload).map((key) => signedPayload[key]);
    const voteFromPayload = arr.find((v) => v.proposalId === proposal.id);

    const votingPower = await this._votesService.getNumVotes(
      {
        address: vote.address,
        communityAddress: voteFromPayload.communityAddress,
      },
      proposal.auction.balanceBlockTag,
    );
    if (!votingPower) {
      return false;
    }

    const validatedSignerVotes = await this._votesService.findByAddress(
      vote.address,
      {
        signatureState: SignatureState.VALIDATED,
      },
    );

    const signerVotesForAuction = validatedSignerVotes
      .filter((vote) => vote.proposal.auctionId === proposal.auctionId)
      .sort((a, b) => (a.createdDate < b.createdDate ? -1 : 1));

    const aggVoteWeightSubmitted = signerVotesForAuction.reduce(
      (agg, current) => Number(agg) + Number(current.weight),
      0,
    );
    return aggVoteWeightSubmitted + voteFromPayload.weight <= votingPower;
  }
}
