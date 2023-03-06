import { ipfs, json, log } from '@graphprotocol/graph-ts';
import { ContractURIUpdated, Transfer } from '../generated/templates/CommunityHouse/CommunityHouse';
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

  // If URI is empty, clear fields
  if (!event.params.uri.length) {
    house.name = null;
    house.description = null;
    house.imageURI = null;

    house.save();
    return;
  }

  const data = ipfs.cat(event.params.uri.replace('ipfs://', ''));
  if (!data) {
    log.error('[handleHouseURIUpdated] Could not fetch IPFS data for URI: {}. URI Update Hash: {}', [
      event.params.uri,
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const result = json.try_fromBytes(data);
  if (result.isError) {
    log.error('[handleHouseURIUpdated] Could not parse IPFS data for URI: {}. Error: {}. URI Update Hash: {}', [
      event.params.uri,
      result.error.toString(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const metadata = result.value.toObject();
  const name = metadata.get('name');
  const description = metadata.get('description');
  const imageURI = metadata.get('image'); 

  house.name = name ? name.toString() : null;
  house.description = description ? description.toString() : null;
  house.imageURI = imageURI ? imageURI.toString() : null;
  house.save();
}
