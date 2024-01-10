import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import Checkpoint, { LogLevel } from 'checkpoint-beta';
import config from './config.json';
import * as writers from './writers';
import EthereumRoundFactoryABI from './abis/EthereumRoundFactory.json';
import TimedRoundABI from './abis/TimedRound.json';
import { StarknetProvider } from './starknet-provider';

const dir = __dirname.endsWith('dist/src') ? '../' : '';
const schemaFile = path.join(__dirname, `${dir}../src/schema.gql`);
const schema = fs.readFileSync(schemaFile, 'utf8');

if (process.env.NETWORK_NODE_URL) {
  config.network_node_url = process.env.NETWORK_NODE_URL;
}

const checkpointOptions = {
  logLevel: LogLevel.Info,
  prettifyLogs: process.env.NODE_ENV !== 'production',
  resetOnConfigChange: true,
  abis: {
    EthereumRoundFactory: EthereumRoundFactoryABI,
    TimedRound: TimedRoundABI,
  },
  NetworkProvider: StarknetProvider,
};

const checkpoint = new Checkpoint(config, writers, schema, checkpointOptions);

checkpoint.start();

const app = express();
app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ limit: '4mb', extended: false }));
app.use(cors({ maxAge: 86400 }));
app.use('/', checkpoint.graphql);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}`));
