import { HardhatUserConfig } from 'hardhat/config';
import 'starknet-hardhat-plugin-extended';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-preprocessor';
import dotenv from 'dotenv';
import fs from 'fs';
import './tasks';

dotenv.config();

const { ETH_MNEMONIC, ETH_PRIVATE_KEY } = process.env;

const getRemappings = () => {
  return fs
    .readFileSync('remappings.txt', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => line.trim().split('='));
};

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.17',
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 10,
      },
    },
  },
  paths: {
    sources: 'contracts',
    cache: 'cache_hardhat', // Use a different cache for Hardhat than Foundry
    cairoPaths: ['lib/fossil/contracts'],
  },
  // This fully resolves paths for imports in the ./lib directory for Hardhat
  preprocess: {
    eachLine: () => ({
      transform: (line: string) => {
        if (line.match(/^\s*import /i)) {
          getRemappings().forEach(([find, replace]) => {
            if (line.match(find)) {
              line = line.replace(find, replace);
            }
          });
        }
        return line;
      },
    }),
  },
  mocha: {
    timeout: 120_000,
  },
  starknet: {
    venv: 'active',
    network: 'starknetLocal',
    wallets: {
      Deployer: {
        accountName: 'OpenZeppelin',
        modulePath: 'starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount',
        accountPath: '~/.starknet_accounts',
      },
    },
  },
  networks: {
    ethereumLocal: {
      url: 'http://127.0.0.1:8545/',
    },
    starknetLocal: {
      url: 'http://127.0.0.1:5050/',
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`,
      accounts: ETH_MNEMONIC ? { mnemonic: ETH_MNEMONIC } : [ETH_PRIVATE_KEY!].filter(Boolean),
    },
  },
};

export default config;
