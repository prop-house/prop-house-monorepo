import { TokenType } from './TokenType';

export interface RoundMetadata {
  name: string;
  about: string;
  avatar: string;
  votingTokenType: TokenType;
  votingTokenContractAddress: string;
  // proposal validation:  https://github.com/snapshot-labs/snapshot.js/blob/master/src/validations/timeperiod/examples.json
}
