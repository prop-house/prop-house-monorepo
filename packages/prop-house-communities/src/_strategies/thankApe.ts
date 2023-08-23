import ThriveCoinVoterList from '../abi/ThriveCoinVoterList.json';
import { Contract, providers } from 'ethers';
import { parseBlockTag } from '../utils/parseBlockTag';
import { StrategyFactory, _Strategy } from '../types/_Strategy';
import { BaseArgs } from '../actions/execStrategy';
import { balanceOfErc20, balanceOfErc20StratArgs } from './balanceOfErc20';

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

    // ThriveCoin
    const contract = new Contract(address, ThriveCoinVoterList, provider);
    const hasVoteRight = await contract.hasVoteRight(account, {
      blockTag: parseBlockTag(polygonBlockNumber),
    });

    // ApeCoin
    const mainnetProvider = new providers.InfuraProvider(process.env.INFURA_PROJECT_ID);
    const apeCoinContractAddress = '0x4d224452801ACEd8B2F0aebE155379bb5D594381';
    const balanceOfErc20Args = {
      strategyName: 'balanceOfErc20',
      account: account,
      provider: mainnetProvider,
      contract: apeCoinContractAddress,
      mainnetBlockNumber,
      decimals: 18,
      multiplier: 1,
    } as balanceOfErc20StratArgs;
    const apeBalance = await balanceOfErc20(balanceOfErc20Args)();

    // Tiered voting
    if (apeBalance >= 100000) return 80;
    if (apeBalance >= 10000) return 40;
    if (apeBalance >= 1000) return 20;
    if (apeBalance >= 100) return 10;
    if (apeBalance >= 10 || hasVoteRight) return 5;
    if (apeBalance >= 1) return 1;
    return 0;
  };
};
