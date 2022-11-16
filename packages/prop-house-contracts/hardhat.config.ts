import { HardhatUserConfig, task } from 'hardhat/config';
import './tasks/deploy';
import 'starknet-hardhat-plugin-extended';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-preprocessor';
import fs from 'fs';

const getRemappings = () => {
  return fs
    .readFileSync('remappings.txt', 'utf8')
    .split('\n')
    .filter(Boolean)
    .map(line => line.trim().split('='));
};

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.16',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
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
  },
  networks: {
    ethereumLocal: {
      url: 'http://127.0.0.1:8545/',
    },
    starknetLocal: {
      url: 'http://127.0.0.1:5050/',
    },
  },
};

export default config;
