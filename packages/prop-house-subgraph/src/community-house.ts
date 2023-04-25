import { log } from '@graphprotocol/graph-ts';
import { ContractURIUpdated, Transfer } from '../generated/templates/CommunityHouse/CommunityHouse';
import { HouseMetadata as HouseMetadataTemplate } from '../generated/templates';
import { Account, House, Round } from '../generated/schema';
import { ZERO_ADDRESS } from './lib/constants';

export function handleRoundTransfer(event: Transfer): void {
  if (event.params.from.toHex() == ZERO_ADDRESS) {
    return; // Handled by `handleRoundCreated`
  }

  const round = Round.load(event.params.tokenId.toHex());
  if (!round) {
    log.error('[handleRoundTransfer] Round not found: {}. Transfer Hash: {}', [
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

  round.manager = to.id;
  round.save();
}

export function handleHouseURIUpdated(event: ContractURIUpdated): void {
  const house = House.load(event.address.toHex());
  if (!house) {
    log.error('[handleHouseURIUpdated] House not found: {}. URI Update Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  house.contractURI = event.params.uri;

  // If URI is empty, clear house metadata
  if (!event.params.uri.length) {
    house.metadata = null;

    house.save();
    return;
  }

  house.metadata = event.params.uri.replace('ipfs://', '');

  HouseMetadataTemplate.create(house.metadata!);
  house.save();
}
