import { log, store } from '@graphprotocol/graph-ts';
import { TransferBatch, TransferSingle } from '../generated/CreatorPassIssuer/CreatorPassIssuer';
import { Account, House, HouseCreator } from '../generated/schema';
import { ZERO_ADDRESS } from './lib/constants';

export function handleSingleTransfer(event: TransferSingle): void {
  if (event.params.from.toHex() == ZERO_ADDRESS) {
    // Mint
    let to = Account.load(event.params.to.toHex());
    if (!to) {
      to = new Account(event.params.to.toHex());
      to.save();
    }

    const house = House.load(event.params.id.toHex());
    if (!house) {
      log.error('[handleSingleTransfer] House Not Found: {}. Creator Pass Mint Hash: {}', [
        event.params.id.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }

    const houseCreatorId = `${house.id}-${to.id}`;
    let houseCreator = HouseCreator.load(houseCreatorId);
    if (!houseCreator) {
      houseCreator = new HouseCreator(houseCreatorId);
      houseCreator.house = house.id;
      houseCreator.creator = to.id;
      houseCreator.passCount = 0;
    }
    houseCreator.passCount += 1;
    houseCreator.save();
  } else if (event.params.to.toHex() == ZERO_ADDRESS) {
    // Burn
    const from = Account.load(event.params.from.toHex());
    if (!from) {
      log.error('[handleSingleTransfer] From Account Not Found: {}. Creator Pass Burn Hash: {}', [
        event.params.from.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    const house = House.load(event.params.id.toHex());
    if (!house) {
      log.error('[handleSingleTransfer] House Not Found: {}. Creator Pass Burn Hash: {}', [
        event.params.id.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    const houseCreatorId = `${house.id}-${from.id}`;
    const houseCreator = HouseCreator.load(houseCreatorId);
    if (!houseCreator) {
      log.error('[handleSingleTransfer] House Creator Not Found: {}. Creator Pass Burn Hash: {}', [
        houseCreatorId,
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    houseCreator.passCount -= 1;
    houseCreator.save();

    if (houseCreator.passCount == 0) {
      store.remove('HouseCreator', houseCreatorId);
    }
  } else {
    // Transfer
    const from = Account.load(event.params.from.toHex());
    if (!from) {
      log.error('[handleSingleTransfer] From Account Not Found: {}. Creator Pass Transfer Hash: {}', [
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

    const house = House.load(event.params.id.toHex());
    if (!house) {
      log.error('[handleSingleTransfer] House Not Found: {}. Creator Pass Transfer Hash: {}', [
        event.params.id.toHex(),
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    const fromHouseCreatorId = `${house.id}-${from.id}`;
    const fromHouseCreator = HouseCreator.load(fromHouseCreatorId);
    if (!fromHouseCreator) {
      log.error('[handleSingleTransfer] From House Creator Not Found: {}. Creator Pass Transfer Hash: {}', [
        from.id,
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    fromHouseCreator.passCount -= 1;
    fromHouseCreator.save();

    if (fromHouseCreator.passCount == 0) {
      store.remove('HouseCreator', fromHouseCreatorId);
    }

    const toHouseCreatorId = `${house.id}-${to.id}`;
    let toHouseCreator = HouseCreator.load(toHouseCreatorId);
    if (!toHouseCreator) {
      toHouseCreator = new HouseCreator(toHouseCreatorId);
      toHouseCreator.house = house.id;
      toHouseCreator.creator = to.id;
      toHouseCreator.passCount = 0;
    }
    toHouseCreator.passCount += 1;
    toHouseCreator.save();
  }
}

export function handleBatchTransfer(event: TransferBatch): void {
  if (event.params.from.toHex() == ZERO_ADDRESS || event.params.to.toHex() == ZERO_ADDRESS) {
    log.error('[handleBatchTransfer] Batch mints and burns are not supported. Hash: {}', [
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const from = Account.load(event.params.from.toHex());
  if (!from) {
    log.error('[handleBatchTransfer] From Account Not Found: {}. Creator Pass Batch Transfer Hash: {}', [
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
    const houseId = event.params.ids[i].toHex();
    const fromHouseCreatorId = `${houseId}-${from.id}`;
    const fromHouseCreator = HouseCreator.load(fromHouseCreatorId);
    if (!fromHouseCreator) {
      log.error('[handleBatchTransfer] From House Creator Not Found: {}. Creator Pass Transfer Hash: {}', [
        fromHouseCreatorId,
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    fromHouseCreator.passCount -= 1;
    fromHouseCreator.save();

    if (fromHouseCreator.passCount == 0) {
      store.remove('HouseCreator', fromHouseCreatorId);
    }

    const toHouseCreatorId = `${houseId}-${to.id}`;
    let toHouseCreator = HouseCreator.load(toHouseCreatorId);
    if (!toHouseCreator) {
      toHouseCreator = new HouseCreator(toHouseCreatorId);
      toHouseCreator.house = houseId;
      toHouseCreator.creator = to.id;
      toHouseCreator.passCount = 0;
    }
    toHouseCreator.passCount += 1;
    toHouseCreator.save();
  }
}
