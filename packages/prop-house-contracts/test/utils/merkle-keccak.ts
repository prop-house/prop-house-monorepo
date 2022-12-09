import { keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import { BigNumberish } from 'ethers';
import MerkleTree from 'merkletreejs';

interface Winner {
  proposalId: BigNumberish;
  proposerAddress: string;
  assetId: string;
  assetAmount: BigNumberish;
}

/**
 * Generate a single leaf for a funding house claim merkle tree
 * @param winner Information relating to a round winner
 */
export const generateClaimLeaf = (winner: Winner) => {
  const { proposalId, proposerAddress, assetId, assetAmount } = winner;
  return Buffer.from(
    solidityKeccak256(
      ['uint256', 'uint256', 'bytes32', 'uint256'],
      [proposalId, proposerAddress, assetId, assetAmount],
    ).slice(2),
    'hex',
  ).toString('hex');
};

/**
 * Generate a claim merkle tree
 * @param winnersOrLeaves Round winner information or leaves
 */
export const generateClaimMerkleTree = (winnersOrLeaves: Winner[] | string[]) => {
  const leaves = winnersOrLeaves.map(winner => {
    if (typeof winner !== 'string') {
      return generateClaimLeaf(winner);
    }
    return winner;
  });
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
};
