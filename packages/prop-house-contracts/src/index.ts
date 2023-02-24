export { PropHouse__factory } from '../typechain/factories/PropHouse__factory';
export { CommunityHouse__factory } from '../typechain/factories/CommunityHouse__factory';
export { TimedFundingRound__factory } from '../typechain/factories/TimedFundingRound__factory';

export { PropHouse as PropHouseContract } from '../typechain/PropHouse';
export { CommunityHouse as CommunityHouseContract } from '../typechain/CommunityHouse';
export { TimedFundingRound as TimedFundingRoundContract } from '../typechain/TimedFundingRound';

export {
  ChainId,
  HouseImpls,
  RoundImpls,
  VotingStrategies,
  EVMContracts,
  StarknetContracts,
  ContractAddresses,
  contracts,
  getContractAddressesForChainOrThrow,
} from './addresses';
