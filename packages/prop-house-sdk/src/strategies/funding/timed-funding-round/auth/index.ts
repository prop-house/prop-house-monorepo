export * from './vanilla';
export * from './eth-sig';

import { vanillaAuthStrategy } from './vanilla';
import { ethSigAuthStrategy } from './eth-sig';

export const DEFAULT_AUTH_STRATEGIES = {
  '0xdeadbeef1': vanillaAuthStrategy,
  '0xdeadbeef2': ethSigAuthStrategy,
};
