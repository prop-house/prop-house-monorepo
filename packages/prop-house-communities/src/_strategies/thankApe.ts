import ThriveCoinVoterList from '../abi/ThriveCoinVoterList.json';
import ApeCoinStaking from '../abi/ApeCoinStaking.json';
import { Contract, providers } from 'ethers';
import { parseBlockTag } from '../utils/parseBlockTag';
import { StrategyFactory, _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';
import { balanceOfErc20, balanceOfErc20StratArgs } from './balanceOfErc20';
import BigNumber from 'bignumber.js';
import { formatUnits } from 'ethers/lib/utils';

export interface thankApeStratArgs extends BaseArgs {
  address: string;
  polygonBlockNumber?: number;
  mainnetBlockNumber?: number;
}

export const thankApe: StrategyFactory<thankApeStratArgs> = (
  params: thankApeStratArgs,
): _Strategy => {
  return async () => {
    const { account, address, polygonBlockNumber, mainnetBlockNumber, provider } = params;

    const mainnetProvider = new providers.InfuraProvider(process.env.INFURA_PROJECT_ID);

    // ThriveCoin
    const contract = new Contract(address, ThriveCoinVoterList, provider);
    const hasVoteRight = await contract.hasVoteRight(account, {
      blockTag: parseBlockTag(polygonBlockNumber),
    });

    // Staked ApeCoin
    const stakedApeCoinContractAddress = '0x5954aB967Bc958940b7EB73ee84797Dc8a2AFbb9';
    const stakedApeCoin = new Contract(
      stakedApeCoinContractAddress,
      ApeCoinStaking,
      mainnetProvider,
    );
    const stakedApeCoinBalance = await stakedApeCoin.stakedTotal(account, {
      blockTag: parseBlockTag(mainnetBlockNumber),
    });
    const parsedStakedApeCoinBalance = new BigNumber(
      formatUnits(stakedApeCoinBalance, 15).toString(),
    ).toNumber();

    // ApeCoin
    const apeCoinContractAddress = '0x4d224452801ACEd8B2F0aebE155379bb5D594381';
    const balanceOfErc20Args = {
      strategyName: 'balanceOfErc20',
      account: account,
      provider: mainnetProvider,
      contract: apeCoinContractAddress,
      blockTag: mainnetBlockNumber,
      decimals: 18,
      multiplier: 1,
    } as balanceOfErc20StratArgs;
    const apeBalance = await balanceOfErc20(balanceOfErc20Args)();

    const totalApeCoin = apeBalance + parsedStakedApeCoinBalance;

    // Tiered voting
    if (totalApeCoin >= 100000) return 80;
    if (totalApeCoin >= 10000) return 40;
    if (totalApeCoin >= 1000) return 20;
    if (totalApeCoin >= 100) return 10;
    if (totalApeCoin >= 10 || hasVoteRight) return 5;
    if (totalApeCoin >= 1) return 1;
    return 0;
  };
};
