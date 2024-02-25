import { Timed } from '@prophouse/sdk-react';

export const COMPLETED_ROUND_OVERRIDES: Record<string, { state: Timed.RoundState; winners: number[] }> = {
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
    winners: [2, 7, 3, 5, 4],
  },
  // Indexers Index
  '0x57347c22f0a0a764c0aa3554cc3df20ca7ceb28d': {
    state: Timed.RoundState.COMPLETE,
    winners: [10, 16, 13],
  },
  // qDAUs of the Year
  '0x9a9bb3c4bb4071ad572782dae78afc128a4b5f52': {
    state: Timed.RoundState.COMPLETE,
    winners: [14, 23, 6, 21, 18],
  },
  // bitRound 1
  '0xd7fa793a4a2a3239badb60fa7d2cd9f7db2ce3ea': {
    state: Timed.RoundState.COMPLETE,
    winners: [4, 13, 8, 12],
  },
  // Kontes Art
  '0xc0f6d6df63a28e487d56f5d880908d8dcc1c13c8': {
    state: Timed.RoundState.COMPLETE,
    winners: [14, 80, 54, 105, 120, 96, 100, 124, 112, 118],
  },
  // Kontes Builders
  '0x408c727995e2979b5bfb22ea6ffc9e1f42f8fae3': {
    state: Timed.RoundState.COMPLETE,
    winners: [1, 9, 24, 22, 2, 40, 7, 41, 17, 15],
  },
  // Kontes Bisnis Plan
  '0xe5d502eb06128768ee97b459233a022fa4a128ff': {
    state: Timed.RoundState.COMPLETE,
    winners: [7, 24, 51, 35, 27, 25, 54, 39, 47, 9],
  },
};

export const HIDDEN_ROUND_OVERRIDES = [
  // Nouns Esports
  '0x0219c27b23972086a615df35adb653838e851b9b',
];

export const GOV_POWER_OVERRIDES: Record<string, { decimals: number }> = {
  // $FARTS
  '0x7a5a9ddbbb10726daf19aedf8d8c402e44dc5215': {
    decimals: 18,
  },
};
