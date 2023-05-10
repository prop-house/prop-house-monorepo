import { ethers } from 'hardhat';
import { hash } from 'starknet';

export const PROPOSE_SELECTOR = hash.getSelectorFromName('propose');
export const CANCEL_PROPOSAL_SELECTOR = hash.getSelectorFromName('cancel_proposal');
export const VOTE_SELECTOR = hash.getSelectorFromName('vote');
export const AUTHENTICATE_SELECTOR = hash.getSelectorFromName('authenticate');

export const ONE_ETHER = ethers.utils.parseEther('1');

export const ONE_DAY_SEC = 60 * 60 * 24;

export const STARKNET_MAX_FEE = BigInt(3e15);

export const HOUSE_NAME = 'Test House';

export const HOUSE_SYMBOL = 'TEST';

export const CONTRACT_URI = 'ipfs://test_uri';

export const METADATA_URI = 'My first proposal!';
