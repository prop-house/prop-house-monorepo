import { getCodegenConfig } from './gql-codegen';

export default getCodegenConfig(
  'https://api.thegraph.com/subgraphs/name/prop-house/prop-house',
  ['./src/gql/queries.evm.ts'],
  'evm',
);
