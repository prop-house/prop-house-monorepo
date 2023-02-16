export enum ChainId {
  EthereumMainnet = 1,
  EthereumGoerli = 5,
  EthereumHardhat = 31337,
}

export interface HouseImpls {
  funding: string;
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

export interface EVMContracts {
  prophouse: string;
  house: HouseImpls;
  round: RoundImpls;
}

export interface StarknetContracts {
  voting: VotingStrategies;
}

export interface ContractAddresses {
  evm: EVMContracts;
  starknet: StarknetContracts;
}

export const contracts: Record<number, ContractAddresses> = {
  [ChainId.EthereumGoerli]: {
    evm: {
      prophouse: '',
      house: {
        funding: '',
      },
      round: {
        timedFunding: '',
      },
    },
    starknet: {
      voting: {
        balanceOf: '',
        balanceOfMultiplier: '',
        whitelist: '',
        vanilla: '',
      },
    },
  },
};

/**
 * Get addresses of contracts that have been deployed to a supported chain.
 * Throws if there are no known contracts deployed on the corresponding chain.
 * @param chainId The desired chainId
 */
export const getContractAddressesForChainOrThrow = (chainId: number): ContractAddresses => {
  if (!contracts[chainId]) {
    throw new Error(
      `Unknown chain id (${chainId}). No known contracts have been deployed on this chain.`,
    );
  }
  return contracts[chainId];
};
