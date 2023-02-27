import { log, BigInt, Value } from '@graphprotocol/graph-ts';
import { RoundRegistered } from '../generated/templates/TimedFundingRound/TimedFundingRound';
import { Asset, Award, Round, TimedFundingRoundConfig, VotingStrategy } from '../generated/schema';
import { computeAssetID, computeVotingStrategyID, get2DArray, getAssetTypeString, getVotingStrategyType } from './utils';
import { BIGINT_ONE } from './constants';
import { RoundState } from './types';

export function handleRoundRegistered(event: RoundRegistered): void {
  let round = Round.load(event.address.toHex());
  if (!round) {
    log.error('[handleRoundRegistered] Round not found: {}. Registration Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  round.state = RoundState.REGISTERED;
  round.save();


  const config = new TimedFundingRoundConfig(`${event.transaction.hash}-${event.logIndex}`);

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
      strategy.type = getVotingStrategyType(strategyId);
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

    // Split the award between winners, if applicable
    if (event.params.awards.length == 1 && event.params.winnerCount > 1) {
      for (let k = 0; k < event.params.winnerCount; k++) {
        const award = new Award(`${round.id}-${k}`);
        award.asset = asset.id;
        award.amount = awardStruct.amount.div(BigInt.fromU32(event.params.winnerCount));
        award.round = config.id;
        award.save();
      }
    } else {
      const award = new Award(`${round.id}-${i}`);
      award.asset = asset.id;
      award.amount = awardStruct.amount;
      award.round = config.id;
      award.save();
    }
  }

  config.votingStrategies = votingStrategyIds; // TODO: Better to do the relation on the strategy side?
  config.save();
}
