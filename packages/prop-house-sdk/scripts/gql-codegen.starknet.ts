import { getCodegenConfig } from './gql-codegen';

export default getCodegenConfig(
  'https://starknet-subgraph-mainnet.onrender.com',
  ['./src/gql/queries.starknet.ts'],
  'starknet',
);
