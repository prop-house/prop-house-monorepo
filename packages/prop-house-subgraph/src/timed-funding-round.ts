import { log, Value } from '@graphprotocol/graph-ts';
import { RoundRegistered } from '../generated/templates/TimedFundingRound/TimedFundingRound';
import { Asset, Award, Round, TimedFundingRoundConfig, VotingStrategy } from '../generated/schema';
import { BIGINT_ONE } from './constants';
import { computeAssetID, computeVotingStrategyID, get2DArray, getAssetTypeString } from './utils';
import { AssetType, VotingStrategyType } from './types';

export function handleRoundRegistered(event: RoundRegistered): void {
  let round = Round.load(event.address.toHex());
  if (!round) {
    log.error('[handleRoundRegistered] Round not found: {}. Registration Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let config = new TimedFundingRoundConfig(`${event.transaction.hash}-${event.logIndex}`);

  config.winnerCount = event.params.winnerCount;
  config.proposalPeriodStartTimestamp = event.params.proposalPeriodStartTimestamp;
  config.proposalPeriodDuration = event.params.proposalPeriodDuration;
  config.votePeriodStartTimestamp = event.params.proposalPeriodStartTimestamp.plus(
    event.params.proposalPeriodDuration
  ).plus(BIGINT_ONE);
  config.votePeriodDuration = event.params.votePeriodDuration;

  // Store voting strategies
  const votingStrategyIds: string[] = []; 
  const params2D = get2DArray(event.params.votingStrategyParamsFlat);
  for (let i = 0; i < event.params.votingStrategies.length; i++) {
    const strategyId = computeVotingStrategyID(
      event.params.votingStrategies[i],
      params2D[i],
    );
    votingStrategyIds.push(strategyId);

    let strategy = VotingStrategy.load(strategyId);
    if (!strategy) {
      strategy = new VotingStrategy(strategyId);
      strategy.type = VotingStrategyType.BALANCE_OF; // TODO: Pull dynamically
      strategy.address = Value.fromBigInt(event.params.votingStrategies[i]).toBytes();
      strategy.params = Value.fromBigIntArray(params2D[i]).toBytesArray();
      strategy.save();
    }
  }

  // Store awards
  for (let i = 0; i < event.params.awards.length; i++) {
    const awardStruct = event.params.awards[i];
    const assetId = computeAssetID(awardStruct);

    let asset = Asset.load(assetId);
    if (!asset) {
      asset = new Asset(assetId);
      asset.assetType = getAssetTypeString(awardStruct.assetType);
      asset.token = awardStruct.token;
      asset.identifier = awardStruct.identifier;
      asset.save();
    }

    // TODO: If split award, break into smaller pieces
    const award = new Award(`${round.id}-${i}`);
    award.asset = asset.id;
    award.amount = awardStruct.amount;
    award.round = config.id;
    award.save();
  }

  config.votingStrategies = votingStrategyIds; // TODO: Better to do the relation on the strategy side?
  config.save();
}
