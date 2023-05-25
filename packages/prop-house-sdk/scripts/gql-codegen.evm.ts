import { getCodegenConfig } from './gql-codegen';

export default getCodegenConfig(
  'http://localhost:8000/subgraphs/name/prop-house',
  ['./src/gql/queries.evm.ts'],
  'evm',
);
