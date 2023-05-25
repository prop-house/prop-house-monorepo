export { PropHouse__factory } from '../typechain/factories/PropHouse__factory';
export { CommunityHouse__factory } from '../typechain/factories/CommunityHouse__factory';
export { TimedRound__factory } from '../typechain/factories/TimedRound__factory';

export { PropHouse as PropHouseContract } from '../typechain/PropHouse';
export { CommunityHouse as CommunityHouseContract } from '../typechain/CommunityHouse';
export { TimedRound as TimedRoundContract } from '../typechain/TimedRound';

export {
  ChainId,
  HouseImpls,
  RoundImpls,
  GovPowerStrategies,
  EVMContracts,
  StarknetContracts,
  ContractAddresses,
  contracts,
  getContractAddressesForChainOrThrow,
} from './addresses';
