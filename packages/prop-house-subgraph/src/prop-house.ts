import { log } from '@graphprotocol/graph-ts';
import { BatchDepositToRound, DepositToRound, HouseCreated, RoundCreated, Transfer } from '../generated/PropHouse/PropHouse';
import { Account, Asset, Balance, Deposit, House, Round } from '../generated/schema';
import { RoundState, ZERO_ADDRESS } from './lib/constants';
import {
  CommunityHouse as CommunityHouseTemplate,
  TimedFundingRound as TimedFundingRoundTemplate,
} from '../generated/templates';
import { AssetStruct, computeAssetID, getAssetTypeString } from './lib/utils';

export function handleHouseCreated(event: HouseCreated): void {
  const house = new House(event.params.house.toHex());
  house.type = event.params.kind.toString();
  house.createdAt = event.block.timestamp;
  house.creationTx = event.transaction.hash;

  CommunityHouseTemplate.create(event.params.house);

  house.save();
}

export function handleRoundCreated(event: RoundCreated): void {
  const house = House.load(event.params.house.toHex());
  if (!house) {
    log.error('[handleRoundCreated] House not found for round: {}. Creation Hash: {}', [
      event.params.round.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const round = new Round(event.params.round.toHex());
  round.type = event.params.kind.toString();
  round.state = RoundState.AWAITING_REGISTRATION;
  round.house = house.id;
  round.createdAt = event.block.timestamp;
  round.creationTx = event.transaction.hash;

  TimedFundingRoundTemplate.create(event.params.round);

  round.save();
}

export function handleHouseTransfer(event: Transfer): void {
  const house = House.load(event.params.tokenId.toHex());
  if (!house) {
    log.error('[handleHouseTransfer] House not found: {}. Transfer Hash: {}', [
      event.params.tokenId.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const addr = event.params.to.toHex();
  let to = Account.load(addr);
  if (!to) {
    to = new Account(addr);
    to.save();
  }

  if (event.params.from.toHex() == ZERO_ADDRESS) {
    house.creator = to.id;
  }
  house.owner = to.id;
  house.save();
}

export function handleDepositToRound(event: DepositToRound): void {
  // Record the deposit
  const deposit = new Deposit(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
  );

  let depositor = Account.load(event.params.from.toHex());
  if (!depositor) {
    depositor = new Account(event.params.from.toHex());
    depositor.save();
  }

  const assetId = computeAssetID(changetype<AssetStruct>(event.params.asset));
  let asset = Asset.load(assetId);
  if (!asset) {
    asset = new Asset(assetId);
    asset.assetType = getAssetTypeString(event.params.asset.assetType);
    asset.token = event.params.asset.token;
    asset.identifier = event.params.asset.identifier;
    asset.save();
  }

  deposit.depositor = depositor.id;
  deposit.depositedAt = event.block.timestamp;
  deposit.asset = asset.id;
  deposit.amount = event.params.asset.amount;
  deposit.round = event.params.round.toHex();
  deposit.save();

  // Update the round balance
  const balanceId = `${event.params.round.toHex()}-${assetId}`;
  let balance = Balance.load(balanceId);
  if (!balance) {
    balance = new Balance(balanceId);
    balance.asset = asset.id;
    balance.round = event.params.round.toHex();
  }
  balance.balance = balance.balance.plus(event.params.asset.amount);
  balance.updatedAt = event.block.timestamp;
  balance.save();
}

export function handleBatchDepositToRound(event: BatchDepositToRound): void {
  // Record the deposit(s)
  const deposit = new Deposit(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}`,
  );

  let depositor = Account.load(event.params.from.toHex());
  if (!depositor) {
    depositor = new Account(event.params.from.toHex());
    depositor.save();
  }

  for (let i = 0; i < event.params.assets.length; i++) {
    const assetStruct = event.params.assets[i];
    const assetId = computeAssetID(changetype<AssetStruct>(assetStruct));
    let asset = Asset.load(assetId);
    if (!asset) {
      asset = new Asset(assetId);
      asset.assetType = getAssetTypeString(assetStruct.assetType);
      asset.token = assetStruct.token;
      asset.identifier = assetStruct.identifier;
      asset.save();
    }
  
    deposit.depositor = depositor.id;
    deposit.depositedAt = event.block.timestamp;
    deposit.asset = asset.id;
    deposit.amount = assetStruct.amount;
    deposit.round = event.params.round.toHex();
    deposit.save();
  
    // Update the round balance
    const balanceId = `${event.params.round.toHex()}-${assetId}`;
    let balance = Balance.load(balanceId);
    if (!balance) {
      balance = new Balance(balanceId);
      balance.asset = asset.id;
      balance.round = event.params.round.toHex();
    }
    balance.balance = balance.balance.plus(assetStruct.amount);
    balance.updatedAt = event.block.timestamp;
    balance.save();
  }
}
