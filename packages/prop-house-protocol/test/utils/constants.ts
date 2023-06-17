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

// The domain separator hash for the Goerli testnet.
// name: 'prop-house',
// version: '1'
// chainId: '5'
export const EIP_712_DOMAIN_SEPARATOR_GOERLI = BigInt('0x367959fbff4da0a038f30383de089bcd293b7960f35bd1db59a620d4c2cbfd81');
