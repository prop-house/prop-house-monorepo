import { getCodegenConfig } from './gql-codegen';

export default getCodegenConfig(
  'https://checkpoint-v2-api.onrender.com',
  ['./src/gql/queries.starknet.ts'],
  'starknet',
);
