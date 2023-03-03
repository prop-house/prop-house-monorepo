import { log } from '@graphprotocol/graph-ts';
import { HouseRegistered, HouseUnregistered, OwnerUpdated, RoundRegistered, RoundUnregistered } from '../generated/Manager/Manager';
import { Administrative, HouseImplementation, RoundImplementation } from '../generated/schema';

export function handleOwnerUpdated(event: OwnerUpdated): void {
  let admin = Administrative.load(event.address.toHex());
  if (!admin) {
    // This is the first event used in this mapping so we use it to create the entity
    admin = new Administrative(event.address.toHex());
  }

  admin.manager = event.params.newOwner;
  admin.save();
}

export function handleHouseRegistered(event: HouseRegistered): void {
  const admin = Administrative.load(event.address.toHex());
  if (!admin) {
    log.error('[handleHouseRegistered] Manager not found: {}. House Registration Hash: {}', [
      event.address.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  let impl = HouseImplementation.load(event.params.houseImpl.toHex());
  if (!impl) {
    impl = new HouseImplementation(event.params.houseImpl.toHex());
    impl.type = event.params.houseType.toString();
    impl.admin = admin.id;
  }
  impl.isRegistered = true;
  impl.save();
}

export function handleHouseUnregistered(event: HouseUnregistered): void {
  const impl = HouseImplementation.load(event.params.houseImpl.toHex());
  if (!impl) {
    log.error('[handleHouseUnregistered] House implementation not found: {}. House Unregistration Hash: {}', [
      event.params.houseImpl.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  impl.isRegistered = false;
  impl.save();
}

export function handleRoundRegistered(event: RoundRegistered): void {
  const houseImpl = HouseImplementation.load(event.params.houseImpl.toHex());
  if (!houseImpl) {
    log.error('[handleRoundRegistered] House implementation not found: {}. Round Registration Hash: {}', [
      event.params.houseImpl.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const roundId = `${houseImpl.id}-${event.params.roundImpl.toHex()}`;
  let roundImpl = RoundImplementation.load(roundId);
  if (!roundImpl) {
    roundImpl = new RoundImplementation(roundId);
    roundImpl.type = event.params.roundType.toString();
  }
  roundImpl.houseImpl = houseImpl.id;
  roundImpl.isRegistered = true;
  roundImpl.save();
}

export function handleRoundUnregistered(event: RoundUnregistered): void {
  const houseImpl = HouseImplementation.load(event.params.houseImpl.toHex());
  if (!houseImpl) {
    log.error('[handleRoundUnregistered] House implementation not found: {}. Round Unregistration Hash: {}', [
      event.params.houseImpl.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  const roundId = `${houseImpl.id}-${event.params.roundImpl.toHex()}`;
  const roundImpl = RoundImplementation.load(roundId);
  if (!roundImpl) {
    log.error('[handleRoundUnregistered] Round implementation not found: {}. Round Unregistration Hash: {}', [
      event.params.roundImpl.toHex(),
      event.transaction.hash.toHex(),
    ]);
    return;
  }

  roundImpl.isRegistered = false;
  roundImpl.save();
}
