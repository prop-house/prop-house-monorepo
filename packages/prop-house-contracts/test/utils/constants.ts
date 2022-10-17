import { hash } from 'starknet';

export const PROPOSE_SELECTOR = hash.getSelectorFromName('propose');
export const VOTE_SELECTOR = hash.getSelectorFromName('vote');
export const AUTHENTICATE_SELECTOR = hash.getSelectorFromName('authenticate');
