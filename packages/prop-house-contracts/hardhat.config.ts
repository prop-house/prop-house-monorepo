import { HardhatUserConfig, task } from 'hardhat/config';
import { example } from './tasks/example';
import '@shardlabs/starknet-hardhat-plugin';
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

task('example', 'Example task').setAction(example);

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.13',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: 'src',
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
  starknet: {
    venv: 'active',
    network: 'starknetLocal',
  },
  networks: {
    starknetLocal: {
      url: 'http://localhost:5050',
    },
  },
};

export default config;
