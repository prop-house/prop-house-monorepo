import { Call, Provider } from 'starknet';
import { TimedFundingRoundEnvelope } from './funding';

export interface ClientConfig {
  ethUrl: string;
  starkProvider: Provider;
}

export interface IEnvelope<Message, SignatureMessage, Action> {
  address: string;
  signature: Message extends SignatureMessage ? string : null;
  data: {
    action: Action;
    message: Message;
  };
}

export interface AuthStrategy<Message, SignatureMessage, Action> {
  type: string;
  createCall(
    envelope: IEnvelope<Message, SignatureMessage, Action>,
    selector: string,
    calldata: string[],
  ): Call;
}

export type Envelope = TimedFundingRoundEnvelope;

export interface VotingStrategy<E extends Envelope> {
  type: string;
  getParams(
    address: string,
    index: number,
    envelope: E,
    clientConfig: ClientConfig,
  ): Promise<string[]>;
}
