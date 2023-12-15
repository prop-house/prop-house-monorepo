import { Timed } from '@prophouse/sdk-react';

export const ROUND_OVERRIDES: Record<string, { state: Timed.RoundState, winners: number[] }> = {
  // BasePaint
  '0x2fd198c8b641180a593dceda1eaaac6bd0fc8c89': {
    state: Timed.RoundState.COMPLETE,
    winners: [12, 18, 13, 8, 2],
  },
  // CrypToadz
  '0xe1cef36f31d304c2b7cdd7e759774bbb2dc6526f': {
    state: Timed.RoundState.COMPLETE,
    winners: [12, 11, 7, 9, 6],
  },
  // Purple
  '0xc6afa7d53c692ec7f997f2953af18dd449bfe1ed': {
    state: Timed.RoundState.COMPLETE,
    winners: [2, 7, 3, 5, 1],
  },
};
