export interface DbConfig {
  port: number;
  host: string;
  username: string;
  password: string;
  database: string;
}

export interface FileConfig {
  basePath: string;
}

export interface Config {
  database: DbConfig;
  env: string;
  JSONRPC: string;
  file: FileConfig;
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
  JSONRPC: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
  file: {
    basePath: process.env.FILE_BASE_PATH ?? '/data'
  }
});

export const subgraphApiUri =
  'https://api.thegraph.com/subgraphs/name/nounsdao/nouns-subgraph';

export const envComparitorFactory = (value: RegExp) => () =>
  config().env.match(value) !== null;

export const isDevEnv = envComparitorFactory(/^dev(elopment)?$/);

export const isProdEnv = envComparitorFactory(/^prod(uction)?$/);

export default config;
