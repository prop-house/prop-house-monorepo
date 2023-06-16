import { log, BigInt } from '@graphprotocol/graph-ts';
import { AssetRescued, AwardClaimed, RoundCancelled, RoundFinalized, RoundRegistered, TransferBatch, TransferSingle } from '../generated/templates/TimedRound/TimedRound';
import { Account, Asset, Award, Balance, Claim, Reclaim, Rescue, Round, RoundVotingStrategy, TimedRoundConfig, Transfer, GovPowerStrategy, RoundProposingStrategy } from '../generated/schema';
import { AssetStruct, computeAssetID, computeGovPowerStrategyID, get2DArray, getAssetTypeString, getGovPowerStrategyType } from './lib/utils';
import { RoundEventState, BIGINT_ONE, ZERO_ADDRESS, BIGINT_8_WEEKS_IN_SECONDS } from './lib/constants';

export function storeGovPowerStrategy(addresses: BigInt[], params2D: BigInt[][], index: i32): string {
  const address = addresses[index];
  const params = params2D[index];
  const strategyId = computeGovPowerStrategyID(
    address,
    params,
  );

  let strategy = GovPowerStrategy.load(strategyId);
  if (!strategy) {
    strategy = new GovPowerStrategy(strategyId);
    strategy.type = getGovPowerStrategyType(address.toHex());
    strategy.address = address;
    strategy.params = params;
    strategy.save();
  }
  return strategyId;
}

export function handleRoundRegistered(event: RoundRegistered): void {
  const round = Round.load(event.address.toHex());
  if (!round) {
    log.error('[handleRoundRegistered] Round not found: {}. Registration Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  round.eventState = RoundEventState.REGISTERED;

  const config = new TimedRoundConfig(`${round.id}-timed-round-config`);

  config.round = round.id;
  config.winnerCount = event.params.winnerCount;
  config.proposalThreshold = event.params.proposalThreshold;
  config.proposalPeriodStartTimestamp = event.params.proposalPeriodStartTimestamp;
  config.proposalPeriodDuration = event.params.proposalPeriodDuration;
  config.proposalPeriodEndTimestamp = config.proposalPeriodStartTimestamp.plus(
    config.proposalPeriodDuration,
  );
  config.votePeriodStartTimestamp = event.params.proposalPeriodStartTimestamp.plus(
    event.params.proposalPeriodDuration
  ).plus(BIGINT_ONE);
  config.votePeriodDuration = event.params.votePeriodDuration;
  config.votePeriodEndTimestamp = config.votePeriodStartTimestamp.plus(
    config.votePeriodDuration,
  );
  config.claimPeriodEndTimestamp = config.votePeriodEndTimestamp.plus(
    BIGINT_8_WEEKS_IN_SECONDS, // This is an approximation and will be updated upon finalization
  );
  config.registeredAt = event.block.timestamp;
  config.registrationTx = event.transaction.hash;
  config.save();

  // Store proposing strategies
  const proposingStrategyParams2D = get2DArray(event.params.proposingStrategyParamsFlat);
  for (let i = 0; i < event.params.proposingStrategies.length; i++) {
    const strategyId = storeGovPowerStrategy(event.params.proposingStrategies, proposingStrategyParams2D, i);
  
    const roundProposingStrategyId = `${round.id}-${strategyId}-proposing`;
    let roundProposingStrategy = RoundProposingStrategy.load(roundProposingStrategyId);
    if (!roundProposingStrategy) {
      roundProposingStrategy = new RoundProposingStrategy(roundProposingStrategyId);
      roundProposingStrategy.round = round.id;
      roundProposingStrategy.strategy = strategyId;
      roundProposingStrategy.save();
    }
  }

  // Store voting strategies
  const votingStrategyParams2D = get2DArray(event.params.votingStrategyParamsFlat);
  for (let i = 0; i < event.params.votingStrategies.length; i++) {
    const strategyId = storeGovPowerStrategy(event.params.votingStrategies, votingStrategyParams2D, i);
  
    const roundVotingStrategyId = `${round.id}-${strategyId}-voting`;
    let roundVotingStrategy = RoundVotingStrategy.load(roundVotingStrategyId);
    if (!roundVotingStrategy) {
      roundVotingStrategy = new RoundVotingStrategy(roundVotingStrategyId);
      roundVotingStrategy.round = round.id;
      roundVotingStrategy.strategy = strategyId;
      roundVotingStrategy.save();
    }
  }

  // Store awards
  for (let i = 0; i < event.params.awards.length; i++) {
    const awardStruct = event.params.awards[i];
    const assetId = computeAssetID(changetype<AssetStruct>(awardStruct));

    let asset = Asset.load(assetId);
    if (!asset) {
      asset = new Asset(assetId);
      asset.assetType = getAssetTypeString(awardStruct.assetType);
      asset.token = awardStruct.token;
      asset.identifier = awardStruct.identifier;
      asset.save();
    }

    const award = new Award(`${round.id}-${i}`);
    award.asset = asset.id;
    award.amount = awardStruct.amount;
    award.round = config.id;
    award.save();
  }

  round.timedConfig = config.id;
  round.save();
}

export function handleRoundCancelled(event: RoundCancelled): void {
  const round = Round.load(event.address.toHex());
  if (!round) {
    log.error('[handleRoundCancelled] Round not found: {}. Cancellation Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  round.eventState = RoundEventState.CANCELLED;
  round.save();
}

export function handleRoundFinalized(event: RoundFinalized): void {
  const round = Round.load(event.address.toHex());
  if (!round) {
    log.error('[handleRoundFinalized] Round not found: {}. Finalization Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }
  if (round.timedConfig) {
    const timedConfig = TimedRoundConfig.load(round.timedConfig!);
    if (!timedConfig) {
      log.error('[handleRoundFinalized] Timed round config not found: {}. Finalization Hash: {}', [
        event.address.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    timedConfig.claimPeriodEndTimestamp = event.block.timestamp.plus(
      BIGINT_8_WEEKS_IN_SECONDS,
    );
    timedConfig.save();
  }

  round.eventState = RoundEventState.FINALIZED;
  round.save();
}

export function handleAwardClaimed(event: AwardClaimed): void {
  const round = Round.load(event.address.toHex());
  if (!round) {
    log.error('[handleAwardClaimed] Round not found: {}. Claim Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let claimer = Account.load(event.params.claimer.toHex());
  if (!claimer) {
    claimer = new Account(event.params.claimer.toHex());
    claimer.save();
  }

  const claim = new Claim(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
  );
  claim.claimer = claimer.id;
  claim.claimedAt = event.block.timestamp;
  claim.recipient = event.params.recipient;
  claim.proposalId = event.params.proposalId;
  claim.asset = event.params.assetId.toHex();
  claim.amount = event.params.amount;
  claim.round = round.id;
  claim.save();
}

export function handleAssetRescued(event: AssetRescued): void {
  const round = Round.load(event.address.toHex());
  if (!round) {
    log.error('[handleAssetRescued] Round not found: {}. Rescue Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let rescuer = Account.load(event.params.rescuer.toHex());
  if (!rescuer) {
    rescuer = new Account(event.params.rescuer.toHex());
    rescuer.save();
  }

  const rescue = new Rescue(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
  );
  rescue.rescuer = rescuer.id;
  rescue.rescuedAt = event.block.timestamp;
  rescue.asset = event.params.assetId.toHex();
  rescue.amount = event.params.amount;
  rescue.round = round.id;
  rescue.save();
}

export function handleSingleTransfer(event: TransferSingle): void {
  if (event.params.to.toHex() == ZERO_ADDRESS) {
    const reclaimer = Account.load(event.params.from.toHex());
    if (!reclaimer) {
      log.error('[handleSingleTransfer] Reclaimer not found: {}. Reclaim Hash: {}', [
        event.params.from.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }
  
    const reclaim = new Reclaim(
      `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
    );
    reclaim.reclaimer = reclaimer.id;
    reclaim.reclaimedAt = event.block.timestamp;
    reclaim.asset = event.params.id.toHex();
    reclaim.amount = event.params.value;
    reclaim.round = event.address.toHex();
    reclaim.save();

    const balanceId = `${event.address.toHex()}-${event.params.id.toHex()}`;
    let balance = Balance.load(balanceId);
    if (!balance) {
      balance = new Balance(balanceId);
      balance.asset = event.params.id.toHex();
      balance.round = event.address.toHex();
    }
    balance.balance = balance.balance.minus(event.params.value);
    balance.updatedAt = event.block.timestamp;
    balance.save();
  } else if (event.params.from.toHex() != ZERO_ADDRESS) {
    const transfer = new Transfer(
      `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
    );

    const from = Account.load(event.params.from.toHex());
    if (!from) {
      log.error('[handleSingleTransfer] From address not found: {}. Transfer Hash: {}', [
        event.params.from.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }

    let to = Account.load(event.params.to.toHex());
    if (!to) {
      to = new Account(event.params.to.toHex());
      to.save();
    }

    const asset = Asset.load(event.params.id.toHex());
    if (!asset) {
      log.error('[handleSingleTransfer] Asset not found: {}. Transfer Hash: {}', [
        event.params.id.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }

    transfer.from = from.id;
    transfer.to = to.id;
    transfer.transferredAt = event.block.timestamp;
    transfer.asset = asset.id;
    transfer.amount = event.params.value;
    transfer.round = event.address.toHex();
    transfer.save();
  }
}

export function handleBatchTransfer(event: TransferBatch): void {
  if (event.params.to.toHex() == ZERO_ADDRESS) {
    const reclaimer = Account.load(event.params.from.toHex());
    if (!reclaimer) {
      log.error('[handleSingleTransfer] Reclaimer not found: {}. Reclaim Hash: {}', [
        event.params.from.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }
  
    for (let i = 0; i < event.params.ids.length; i++) {
      const assetId = event.params.ids[i].toHex();
      const value = event.params.values[i];
      const reclaim = new Reclaim(
        `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
      );
      reclaim.reclaimer = reclaimer.id;
      reclaim.reclaimedAt = event.block.timestamp;
      reclaim.asset = assetId;
      reclaim.amount = value;
      reclaim.round = event.address.toHex();
      reclaim.save();
  
      const balanceId = `${event.address.toHex()}-${assetId}`;
      let balance = Balance.load(balanceId);
      if (!balance) {
        balance = new Balance(balanceId);
        balance.asset = assetId;
        balance.round = event.address.toHex();
      }
      balance.balance = balance.balance.minus(value);
      balance.updatedAt = event.block.timestamp;
      balance.save();
    }
  } else if (event.params.from.toHex() != ZERO_ADDRESS) {
    const transfer = new Transfer(
      `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
    );

    const from = Account.load(event.params.from.toHex());
    if (!from) {
      log.error('[handleSingleTransfer] From address not found: {}. Transfer Hash: {}', [
        event.params.from.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }

    let to = Account.load(event.params.to.toHex());
    if (!to) {
      to = new Account(event.params.to.toHex());
      to.save();
    }

    for (let i = 0; i < event.params.ids.length; i++) {
      const assetId = event.params.ids[i].toHex();
      const asset = Asset.load(assetId);
      if (!asset) {
        log.error('[handleSingleTransfer] Asset not found: {}. Transfer Hash: {}', [
          assetId,
          event.transaction.hash.toHex(),
        ]);
        return;
      }
  
      transfer.from = from.id;
      transfer.to = to.id;
      transfer.transferredAt = event.block.timestamp;
      transfer.asset = asset.id;
      transfer.amount = event.params.values[i];
      transfer.round = event.address.toHex();
      transfer.save();
    }
  }
}
