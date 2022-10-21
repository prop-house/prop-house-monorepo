import { CaseInsensitiveMap } from '../types/CaseInsensitiveMap';
import { RoundStrategies } from '../types/RoundStrategies';
import { nounsRoundStrats } from './nouns';

/**
 * Round strategies for communities
 */
export const communityRoundStrategies = new CaseInsensitiveMap<RoundStrategies>(
  Object.entries({
    // nouns
    '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03': nounsRoundStrats,
  }),
);
