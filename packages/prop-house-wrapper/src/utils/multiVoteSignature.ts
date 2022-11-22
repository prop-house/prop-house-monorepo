import { TypedDataSigner } from '@ethersproject/abstract-signer';
import { Signer } from 'ethers';
import { DomainSeparator, VoteMessageTypes } from '../types/eip712Types';

/**
 * Signature for payload of all votes
 */
export const multiVoteSignature = async (
  signer: Signer,
  isContract: boolean,
  allVotesPayload: {},
) => {
  if (isContract) return await signer.signMessage(JSON.stringify(allVotesPayload));

  const typedSigner = signer as Signer & TypedDataSigner;
  return await typedSigner._signTypedData(DomainSeparator, VoteMessageTypes, allVotesPayload);
};
