import { MerkleTree, IncrementalMerkleTree } from 'merkletreejs';
import { keccak256, solidityKeccak256 } from 'ethers/lib/utils';
import { BigNumberish, ethers } from 'ethers';

interface TimedRoundWinner {
  proposalId: BigNumberish;
  position: BigNumberish;
  proposer: string;
  assetId: string;
  assetAmount: BigNumberish;
}

interface InfiniteRoundWinner {
  proposalId: BigNumberish;
  proposer: string;
  requestedAssetsHash: string;
}

/**
 * Generate a single leaf for a claim merkle tree
 * @param winner Information relating to a round winner
 */
export const generateClaimLeaf = (winner: TimedRoundWinner) => {
  const { proposalId, position, proposer, assetId, assetAmount } = winner;
  return Buffer.from(
    solidityKeccak256(
      ['uint256', 'uint256', 'uint256', 'bytes32', 'uint256'],
      [proposalId, position, proposer, assetId, assetAmount],
    ).slice(2),
    'hex',
  ).toString('hex');
};

/**
 * Generate a claim merkle tree
 * @param winnersOrLeaves Round winner information or leaves
 */
export const generateClaimMerkleTree = (winnersOrLeaves: TimedRoundWinner[] | string[]) => {
  const leaves = winnersOrLeaves.map(winner => {
    if (typeof winner !== 'string') {
      return generateClaimLeaf(winner);
    }
    return winner;
  });
  return new MerkleTree(leaves, keccak256, { sortPairs: true });
};

/**
 * Generate a single leaf for an claim incremental merkle tree
 * @param winner Information relating to a round winner
 */
export const generateIncrementalClaimLeaf = (winner: InfiniteRoundWinner) => {
  const { proposalId, proposer, requestedAssetsHash } = winner;
  console.log({ proposalId, proposer, requestedAssetsHash })
  return `0x${Buffer.from(
    solidityKeccak256(
      ['uint256', 'uint256', 'bytes32'],
      [proposalId, proposer, requestedAssetsHash],
    ).slice(2),
    'hex',
  ).toString('hex')}`;
};

/**
 * Generate a claim incremental merkle tree
 * @param winnersOrLeaves Round winner information or leaves
 */
export const generateIncrementalClaimMerkleTree = (winnersOrLeaves: InfiniteRoundWinner[] | string[]) => {
  const keccak = (inputs: unknown[]) => {
    const hash = ethers.utils.solidityKeccak256(
      inputs.map(() => 'uint256'),
      inputs,
    );
    return IncrementalMerkleTree.bigNumberify(hash);
  }
  const tree = new IncrementalMerkleTree(keccak, {
    depth: 10,
    arity: 2,
    zeroValue: 0
  });
  winnersOrLeaves.forEach(winner => {
    if (typeof winner !== 'string') {
      winner = generateIncrementalClaimLeaf(winner);
    }
    tree.insert(winner);
  });
  return tree;
};
