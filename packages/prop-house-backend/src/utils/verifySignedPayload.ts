import { HttpException, HttpStatus } from '@nestjs/common';
import { InfiniteAuctionProposal } from 'src/proposal/infauction-proposal.entity';
import { Proposal } from 'src/proposal/proposal.entity';
import { CreateVoteDto } from 'src/vote/vote.types';

/**
 * Verifies that signed vote matches CreateVoteDto
 * @returns decoded vote jsonb from signed payload
 */
export const verifySignedPayload = (
  createVoteDto: CreateVoteDto,
  proposal: Proposal | InfiniteAuctionProposal,
) => {
  // Get corresponding vote from signed payload (bulk voting payloads may have multiple votes)
  const signedPayload = JSON.parse(
    Buffer.from(createVoteDto.signedData.message, 'base64').toString(),
  );

  const voteDtos: CreateVoteDto[] = signedPayload.votes;
  const voteFromPayload = voteDtos.find((v) => v.proposalId === proposal.id);

  if (!voteFromPayload)
    throw new HttpException(
      'Signed payload does not contain vote for proposal being voted on (dto)',
      HttpStatus.NOT_FOUND,
    );

  // Verify that signed payload is for corresponding prop and community
  if (
    voteFromPayload.proposalId !== createVoteDto.proposalId ||
    voteFromPayload.communityAddress !== createVoteDto.communityAddress ||
    voteFromPayload.weight !== createVoteDto.weight
  )
    throw new HttpException(
      "Signed payload and supplied data doesn't match",
      HttpStatus.BAD_REQUEST,
    );

  return voteFromPayload;
};
