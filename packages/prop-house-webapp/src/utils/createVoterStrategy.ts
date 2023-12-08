import {
  AssetType,
  GovPowerStrategyConfig,
  VotingStrategyType,
  AllowlistMember,
} from '@prophouse/sdk-react';
import { NewVoter } from '../components/HouseManager/VotersConfig';

const createVoterStrategy = (voter: NewVoter): GovPowerStrategyConfig | null => {
  let s: GovPowerStrategyConfig | null = null;

  if (voter.type === VotingStrategyType.BALANCE_OF_ERC1155) {
    s = {
      strategyType: voter.type,
      assetType: AssetType.ERC1155,
      address: voter.address,
      tokenId: voter.tokenId,
      multiplier: voter.multiplier,
    };
  } else if (voter.type === VotingStrategyType.BALANCE_OF) {
    s = {
      strategyType: VotingStrategyType.BALANCE_OF,
      assetType: AssetType.ERC20,
      address: voter.address,
      multiplier: voter.multiplier,
    };
  } else if (voter.type === VotingStrategyType.ALLOWLIST) {
    const newMember: AllowlistMember = {
      address: voter.address,
      govPower: voter.multiplier.toString(),
    };
    s = {
      strategyType: VotingStrategyType.ALLOWLIST,
      members: [newMember],
    };
  }

  return s;
};

export default createVoterStrategy;
