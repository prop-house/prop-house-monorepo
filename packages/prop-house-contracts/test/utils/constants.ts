import { ethers } from 'hardhat';
import { hash } from 'starknet';

export const PROPOSE_SELECTOR = hash.getSelectorFromName('propose');
export const VOTE_SELECTOR = hash.getSelectorFromName('vote');
export const AUTHENTICATE_SELECTOR = hash.getSelectorFromName('authenticate');

export const ONE_ETHER = ethers.utils.parseEther('1');

export const ONE_DAY_SEC = 60 * 60 * 24;
