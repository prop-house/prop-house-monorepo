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
  infinite: string;
  timed: string;
}

export interface GovPowerStrategies {
  allowlist: string;
  balanceOf: string;
  vanilla: string;
}

export interface EthereumAuthStrategies {
  sig: string;
  tx: string;
}

export interface AuthStrategies {
  infinite: EthereumAuthStrategies;
  timed: EthereumAuthStrategies;
}

export interface HetodotusContracts {
  factRegistry: string;
  l1HeadersStore: string;
}

export interface ClassHashes {
  infinite: string;
  timed: string;
}

export interface EVMContracts {
  prophouse: string;
  messenger: string;
  house: HouseImpls;
  round: RoundImpls;
}

export interface StarknetContracts {
  roundFactory: string;
  strategyRegistry: string;
  govPower: GovPowerStrategies;
  auth: AuthStrategies;
  herodotus: HetodotusContracts;
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
      messenger: goerli.ethereum.address.messenger,
      house: {
        community: goerli.ethereum.address.communityHouseImpl,
      },
      round: {
        infinite: goerli.ethereum.address.infiniteRoundImpl,
        timed: goerli.ethereum.address.timedRoundImpl,
      },
    },
    starknet: {
      roundFactory: goerli.starknet.address.roundFactory,
      strategyRegistry: goerli.starknet.address.strategyRegistry,
      govPower: {
        allowlist: goerli.starknet.address.allowlistGovPowerStrategy,
        balanceOf: goerli.starknet.address.ethBalanceOfGovPowerStrategy,
        vanilla: goerli.starknet.address.vanillaGovPowerStrategy,
      },
      auth: {
        infinite: {
          sig: goerli.starknet.address.infiniteRoundEthSigAuthStrategy,
          tx: goerli.starknet.address.infiniteRoundEthTxAuthStrategy,
        },
        timed: {
          sig: goerli.starknet.address.timedRoundEthSigAuthStrategy,
          tx: goerli.starknet.address.timedRoundEthTxAuthStrategy,
        },
      },
      herodotus: {
        factRegistry: goerli.starknet.address.herodotus.factRegistry,
        l1HeadersStore: goerli.starknet.address.herodotus.l1HeadersStore,
      },
      classHashes: {
        infinite: goerli.starknet.classHash.infiniteRound,
        timed: goerli.starknet.classHash.timedRound,
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
