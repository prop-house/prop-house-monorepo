import { ChainId } from '@prophouse/contracts';
import { OrderDirection } from './evm/graphql';
import { GraphQL } from '../types';

export interface QueryConfig<OB, W> {
  page: number;
  perPage: number;
  orderBy?: OB;
  orderDirection?: OrderDirection;
  where?: W;
}

export const GRAPHQL_APIS: Record<number, GraphQL> = {
  [ChainId.EthereumGoerli]: {
    evm: 'https://api.thegraph.com/subgraphs/name/prop-house/prop-house-goerli',
    starknet: 'https://checkpoint-820u.onrender.com',
  },
  [ChainId.EthereumHardhat]: {
    evm: 'http://localhost:8020',
    starknet: 'http://localhost:3000',
  },
};

/**
 * Get GraphQL API URLs that have been deployed for a supported chain.
 * Throws if there are no known GraphQL APIs on the corresponding chain.
 * @param chainId The desired chainId
 */
export const getGraphQlApiUrlsForChainOrThrow = (chainId: number) => {
  if (!GRAPHQL_APIS[chainId]) {
    throw new Error(`Unknown chain id (${chainId}). No known GraphQL APIs exist for this chain.`);
  }
  return GRAPHQL_APIS[chainId];
};

/**
 * Get API clients for all GraphQL APIs that have been deployed for a supported chain.
 * Throws if there are no known GraphQL APIs on the corresponding chain.
 * @param chainId The desired chainId
 */
export const getGraphQlClientsForChainOrThrow = <T>(
  chainId: number,
  getClientInstance: (url: string) => T,
) => {
  const apis = getGraphQlApiUrlsForChainOrThrow(chainId);
  return Object.entries(apis).reduce<GraphQL<T>>((acc, curr) => {
    const [key, value] = curr as [keyof GraphQL<T>, string];
    acc[key] = getClientInstance(value);

    return acc;
  }, {} as GraphQL<T>);
};

/**
 * Get the default request config when querying for many items
 * @param orderBy Which field to order the results by
 */
export const getDefaultConfig = <OB>(orderBy: OB) => ({
  page: 1,
  perPage: 50,
  orderBy: orderBy,
  orderDirection: OrderDirection.Desc,
});

/**
 * Convert the query
 * @param config The query config
 */
export const toPaginated = <OB, W>(config: QueryConfig<OB, W>) => ({
  first: config.page * config.perPage,
  skip: (config.page - 1) * config.perPage,
  orderBy: config.orderBy,
  orderDirection: config.orderDirection,
  where: config.where,
});
