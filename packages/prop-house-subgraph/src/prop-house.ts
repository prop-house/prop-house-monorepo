import { log } from '@graphprotocol/graph-ts';
import { HouseCreated, RoundCreated } from '../generated/PropHouse/PropHouse';
import { Account, House, Round } from '../generated/schema';
import { FundingHouse as FundingHouseTemplate, TimedFundingRound as TimedFundingRoundTemplate } from '../generated/templates';
import { HouseType, RoundState, RoundType } from './types';

export function handleHouseCreated(event: HouseCreated): void {
  let house = new House(event.params.house.toHex());

  let from = event.transaction.from.toHex();
  let creator = Account.load(from);
  if (!creator) {
    creator = new Account(from);
    creator.save();
  }

  // Easier to emit the type than add an if/else to get the type?
  house.type = HouseType.FUNDING;
  house.creator = creator.id;
  house.createdAt = event.block.timestamp;
  house.creationTx = event.transaction.hash;

  FundingHouseTemplate.create(event.params.house);

  house.save();
}

export function handleRoundCreated(event: RoundCreated): void {
  const round = new Round(event.params.round.toHex());

  let from = event.transaction.from.toHex();
  let creator = Account.load(from);
  if (!creator) {
    creator = new Account(from);
    creator.save();
  }

  let house = House.load(event.params.house.toHex());
  if (!house) {
    log.error('[handleRoundCreated] House not found for round: {}. Creation Hash: {}', [
      event.params.round.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  // Easier to emit the type than add an if/else to get the type?
  round.type = RoundType.TIMED_FUNDING;
  round.state = RoundState.AWAITING_REGISTRATION;
  round.house = house.id;
  round.createdAt = event.block.timestamp;
  round.creationTx = event.transaction.hash;
  round.manager = creator.id; // The initial manager is the round creator

  TimedFundingRoundTemplate.create(event.params.round);

  round.save();
}
