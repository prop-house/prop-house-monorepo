import type { Call } from 'starknet';
import { encoding, splitUint256 } from '../../../../utils';
import type {
  TimedFundingRoundAuthStrategy,
  TimedFundingRoundEnvelope,
  EthSigProposeMessage,
  EthSigVoteMessage,
} from '../types';

export const ethSigAuthStrategy: TimedFundingRoundAuthStrategy = {
  type: 'ethSig',
  createCall(
    envelope: TimedFundingRoundEnvelope<EthSigProposeMessage | EthSigVoteMessage>,
    selector: string,
    calldata: string[],
  ): Call {
    const { signature, data } = envelope;
    const { round, authStrategy, salt } = data.message;
    const { r, s, v } = encoding.getRSVFromSig(signature);
    const rawSalt = splitUint256.SplitUint256.fromHex(`0x${salt.toString(16)}`);

    return {
      contractAddress: authStrategy,
      entrypoint: 'authenticate',
      calldata: [
        r.low,
        r.high,
        s.low,
        s.high,
        v,
        rawSalt.low,
        rawSalt.high,
        round,
        selector,
        calldata.length,
        ...calldata,
      ],
    };
  },
};
