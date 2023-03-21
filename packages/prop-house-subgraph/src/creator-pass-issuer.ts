import { log, store } from '@graphprotocol/graph-ts';
import { TransferBatch, TransferSingle } from '../generated/CreatorPassIssuer/CreatorPassIssuer';
import { Account, House, RoundCreator } from '../generated/schema';
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

    const roundCreatorId = `${house.id}-${to.id}`;
    let roundCreator = RoundCreator.load(roundCreatorId);
    if (!roundCreator) {
      roundCreator = new RoundCreator(roundCreatorId);
      roundCreator.house = house.id;
      roundCreator.creator = to.id;
      roundCreator.passCount = 0;
    }
    roundCreator.passCount += 1;
    roundCreator.save();
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
    const roundCreatorId = `${house.id}-${from.id}`;
    const roundCreator = RoundCreator.load(roundCreatorId);
    if (!roundCreator) {
      log.error('[handleSingleTransfer] House Creator Not Found: {}. Creator Pass Burn Hash: {}', [
        roundCreatorId,
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    roundCreator.passCount -= 1;
    roundCreator.save();

    if (roundCreator.passCount == 0) {
      store.remove('RoundCreator', roundCreatorId);
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
    const fromRoundCreatorId = `${house.id}-${from.id}`;
    const fromRoundCreator = RoundCreator.load(fromRoundCreatorId);
    if (!fromRoundCreator) {
      log.error('[handleSingleTransfer] From House Creator Not Found: {}. Creator Pass Transfer Hash: {}', [
        from.id,
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    fromRoundCreator.passCount -= 1;
    fromRoundCreator.save();

    if (fromRoundCreator.passCount == 0) {
      store.remove('RoundCreator', fromRoundCreatorId);
    }

    const toRoundCreatorId = `${house.id}-${to.id}`;
    let toRoundCreator = RoundCreator.load(toRoundCreatorId);
    if (!toRoundCreator) {
      toRoundCreator = new RoundCreator(toRoundCreatorId);
      toRoundCreator.house = house.id;
      toRoundCreator.creator = to.id;
      toRoundCreator.passCount = 0;
    }
    toRoundCreator.passCount += 1;
    toRoundCreator.save();
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
    const fromRoundCreatorId = `${houseId}-${from.id}`;
    const fromRoundCreator = RoundCreator.load(fromRoundCreatorId);
    if (!fromRoundCreator) {
      log.error('[handleBatchTransfer] From House Creator Not Found: {}. Creator Pass Transfer Hash: {}', [
        fromRoundCreatorId,
        event.transaction.hash.toHex(),
      ]);
      return;
    }
    fromRoundCreator.passCount -= 1;
    fromRoundCreator.save();

    if (fromRoundCreator.passCount == 0) {
      store.remove('RoundCreator', fromRoundCreatorId);
    }

    const toRoundCreatorId = `${houseId}-${to.id}`;
    let toRoundCreator = RoundCreator.load(toRoundCreatorId);
    if (!toRoundCreator) {
      toRoundCreator = new RoundCreator(toRoundCreatorId);
      toRoundCreator.house = houseId;
      toRoundCreator.creator = to.id;
      toRoundCreator.passCount = 0;
    }
    toRoundCreator.passCount += 1;
    toRoundCreator.save();
  }
}
