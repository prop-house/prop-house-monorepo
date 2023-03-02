import goerli from '../deployments/goerli.json';

export enum ChainId {
  EthereumMainnet = 1,
  EthereumGoerli = 5,
  EthereumHardhat = 31337,
}

export interface HouseImpls {
  community: string;
}

export interface RoundImpls {
  timedFunding: string;
}

export interface VotingStrategies {
  balanceOf: string;
  balanceOfMultiplier: string;
  whitelist: string;
  vanilla: string;
}

export interface ClassHashes {
  timedFunding: string;
}

export interface EVMContracts {
  prophouse: string;
  house: HouseImpls;
  round: RoundImpls;
}

export interface StarknetContracts {
  voting: VotingStrategies;
  classHashes: ClassHashes;
}

export interface ContractAddresses {
  evm: EVMContracts;
  starknet: StarknetContracts;
}

export const contracts: Record<number, ContractAddresses> = {
  [ChainId.EthereumGoerli]: {
    evm: {
      prophouse: goerli.ethereum.address.propHouse,
      house: {
        community: goerli.ethereum.address.communityHouseImpl,
      },
      round: {
        timedFunding: goerli.ethereum.address.timedFundingRoundImpl,
      },
    },
    starknet: {
      voting: {
        balanceOf: goerli.starknet.address.ethereumBalanceOfVotingStrategy,
        balanceOfMultiplier: goerli.starknet.address.ethereumBalanceOfMultiplierVotingStrategy,
        whitelist: goerli.starknet.address.merkleWhitelistVotingStrategy,
        vanilla: goerli.starknet.address.vanillaVotingStrategy,
      },
      classHashes: {
        timedFunding: goerli.starknet.classHash.timedFundingRound,
      },
    },
  },
};

/**
 * Get addresses of contracts that have been deployed to a supported chain.
 * Throws if there are no known contracts deployed on the corresponding chain.
 * @param chainId The desired chainId
 */
export const getContractAddressesForChainOrThrow = (chainId: number) => {
  if (!contracts[chainId]) {
    throw new Error(
      `Unknown chain id (${chainId}). No known contracts have been deployed on this chain.`,
    );
  }
  return contracts[chainId];
};
