export interface DbConfig {
  port: number;
  host: string;
  username: string;
  password: string;
  database: string;
}

export interface Config {
  database: DbConfig;
  env: string;
  JSONRPC: string;
}

const config = (): Config => ({
  database: {
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    host: process.env.DB_HOST,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
  },
  env: process.env.NODE_ENV ?? 'development',
  JSONRPC: 'https://mainnet.infura.io/v3/0be66e03abae4c0583466f8bc3d003a4',
});

export const subgraphApiUri =
  'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph';

export const envComparitorFactory = (value: RegExp) => () =>
  config().env.match(value) !== null;

export const isDevEnv = envComparitorFactory(/^dev(elopment)?$/);

export const isProdEnv = envComparitorFactory(/^prod(uction)?$/);

export default config;
