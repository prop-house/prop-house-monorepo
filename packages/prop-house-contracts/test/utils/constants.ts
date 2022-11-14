import { ethers } from 'hardhat';
import { hash } from 'starknet';

export const PROPOSE_SELECTOR = hash.getSelectorFromName('propose');
export const CANCEL_PROPOSAL_SELECTOR = hash.getSelectorFromName('cancel_proposal');
export const VOTE_SELECTOR = hash.getSelectorFromName('vote');
export const AUTHENTICATE_SELECTOR = hash.getSelectorFromName('authenticate');

export const ONE_ETHER = ethers.utils.parseEther('1');

export const ONE_DAY_SEC = 60 * 60 * 24;

export const METADATA_URI = 'My first proposal!';

export const DOMAIN = {
  name: 'prop-house',
  version: '1',
  chainId: '5', // Goerli
};

export const PROPOSE_TYPES = {
  Propose: [
    { name: 'auth_strategy', type: 'bytes32' },
    { name: 'house_strategy', type: 'bytes32' },
    { name: 'author', type: 'address' },
    { name: 'metadata_uri', type: 'string' },
    { name: 'salt', type: 'uint256' },
  ],
};

export const VOTE_TYPES = {
  Vote: [
    { name: 'auth_strategy', type: 'bytes32' },
    { name: 'house_strategy', type: 'bytes32' },
    { name: 'voter', type: 'address' },
    { name: 'proposal_votes_hash', type: 'bytes32' },
    { name: 'strategies_hash', type: 'bytes32' },
    { name: 'strategies_params_hash', type: 'bytes32' },
    { name: 'salt', type: 'uint256' },
  ],
};
