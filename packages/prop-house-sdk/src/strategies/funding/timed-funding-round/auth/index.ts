export * from './eth-sig';

import { ethSigAuthStrategy } from './eth-sig';

export const DEFAULT_AUTH_STRATEGIES = {
  '0x12f27b89bbde1de2341ae6514b2797466eccb3d50489f0b29170dae046a0aa9': ethSigAuthStrategy,
};
