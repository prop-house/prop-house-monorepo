import {
  AssetType,
  VotingStrategyConfig,
  VotingStrategyType,
  WhitelistMember,
} from '@prophouse/sdk-react';
import { NewVoter } from '../VotersConfig';

const createVoterStrategy = (voter: NewVoter): VotingStrategyConfig | null => {
  let s: VotingStrategyConfig | null = null;

  if (voter.type === VotingStrategyType.ERC1155_BALANCE_OF) {
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
  } else if (voter.type === VotingStrategyType.WHITELIST) {
    const newMember: WhitelistMember = {
      address: voter.address,
      votingPower: voter.multiplier.toString(),
    };
    s = {
      strategyType: VotingStrategyType.WHITELIST,
      members: [newMember],
    };
  }

  return s;
};

export default createVoterStrategy;
