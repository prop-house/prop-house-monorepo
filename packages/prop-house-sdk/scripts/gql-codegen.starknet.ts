import { getCodegenConfig } from './gql-codegen';

export default getCodegenConfig(
  'https://checkpoint-820u.onrender.com',
  ['./src/gql/queries.starknet.ts'],
  'starknet',
);
