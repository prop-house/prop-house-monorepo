import {
  AssetType,
  GovPowerStrategyConfig,
  VotingStrategyType,
  AllowlistMember,
} from '@prophouse/sdk-react';
import { NewVoter } from '../components/HouseManager/VotersConfig';

/**
 * Known ERC721 checkpointable tokens.
 */
const ERC721_CHECKPOINTABLE_TOKENS = ['0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03' /* Nouns */];

const createVoterStrategy = (voter: NewVoter): GovPowerStrategyConfig | null => {
  let s: GovPowerStrategyConfig | null = null;

  if (voter.type === VotingStrategyType.CHECKPOINTABLE_ERC721 || ERC721_CHECKPOINTABLE_TOKENS.includes(voter.address?.toLowerCase())) {
    s = {
      strategyType: VotingStrategyType.CHECKPOINTABLE_ERC721,
      assetType: AssetType.ERC721,
      address: voter.address,
      multiplier: voter.multiplier,
    };
  } else if (voter.type === VotingStrategyType.BALANCE_OF_ERC1155) {
    s = {
      strategyType: voter.type,
      assetType: AssetType.ERC1155,
      address: voter.address,
      tokenId: voter.tokenId,
      multiplier: voter.multiplier,
    };
  } else if (voter.type === VotingStrategyType.BALANCE_OF_ERC20) {
    s = {
      strategyType: VotingStrategyType.BALANCE_OF_ERC20,
      assetType: AssetType.ERC20,
      address: voter.address,
      multiplier: voter.multiplier,
    };
  } else if (voter.type === VotingStrategyType.BALANCE_OF) {
    s = {
      strategyType: VotingStrategyType.BALANCE_OF,
      assetType: AssetType.ERC721,
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
