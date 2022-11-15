import { Account, hash, Provider } from 'starknet';
import { encoding } from '../../../utils';
import { VotingStrategy } from '../../types';
import { DEFAULT_AUTH_STRATEGIES } from './auth';
import { getTimedFundingRoundProposeCalldata, getTimedFundingRoundVoteCalldata } from './calldata';
import { VOTING_STRATEGY_REGISTRY_ADDRESS } from './constants';
import { DEFAULT_VOTING_STRATEGIES } from './voting';
import {
  EthSigProposeMessage,
  EthSigVoteMessage,
  ProposeMessage,
  TimedFundingRoundAuthStrategy,
  TimedFundingRoundClientConfig,
  TimedFundingRoundEnvelope,
  VoteMessage,
} from './types';

export class TimedFundingRoundClient {
  public readonly ethUrl: string;
  public readonly starkProvider: Provider;
  public readonly authStrategies: Map<string, TimedFundingRoundAuthStrategy>;
  public readonly votingStrategies: Map<string, VotingStrategy<TimedFundingRoundEnvelope>>;

  constructor(config: TimedFundingRoundClientConfig) {
    this.ethUrl = config.ethUrl;
    this.starkProvider = config.starkProvider;
    this.authStrategies = new Map(
      Object.entries({ ...DEFAULT_AUTH_STRATEGIES, ...(config.authStrategies || {}) }).map(
        ([a, s]) => [encoding.hexPadRight(a).toLowerCase(), s],
      ),
    );
    this.votingStrategies = new Map(
      Object.entries({ ...DEFAULT_VOTING_STRATEGIES, ...(config.votingStrategies || {}) }).map(
        ([a, s]) => [encoding.hexPadRight(a).toLowerCase(), s],
      ),
    );
  }

  public async propose(
    account: Account,
    envelope: TimedFundingRoundEnvelope<ProposeMessage | EthSigProposeMessage>,
  ) {
    const { data, address } = envelope;
    const authStrategyAddress = encoding.hexPadRight(data.message.authStrategy).toLowerCase();
    const authStrategy = this.authStrategies.get(authStrategyAddress);
    if (!authStrategy) {
      throw new Error(`Invalid auth strategy: ${authStrategyAddress}`);
    }

    const calldata = getTimedFundingRoundProposeCalldata(address, data.message.metadataUri);
    const call = authStrategy.createCall(envelope, hash.getSelectorFromName('propose'), calldata);
    const fee = await account.estimateFee(call);
    return account.execute(call, undefined, {
      maxFee: fee.suggestedMaxFee,
    });
  }

  public async vote(
    account: Account,
    envelope: TimedFundingRoundEnvelope<VoteMessage | EthSigVoteMessage>,
  ) {
    const { data } = envelope;
    const authStrategyAddress = encoding.hexPadRight(data.message.authStrategy).toLowerCase();
    const authStrategy = this.authStrategies.get(authStrategyAddress);
    if (!authStrategy) {
      throw new Error(`Invalid auth strategy: ${authStrategyAddress}`);
    }

    const votingStrategyAddresses = await this.getVotingStrategyAddresses(envelope);
    const calldata = await this.getVoteCalldata(votingStrategyAddresses, envelope);
    const call = authStrategy.createCall(envelope, hash.getSelectorFromName('vote'), calldata);

    const fee = await account.estimateFee(call);
    return account.execute(call, undefined, {
      maxFee: fee.suggestedMaxFee,
    });
  }

  public async getVoteCalldata(
    strategiesAddresses: string[],
    envelope: TimedFundingRoundEnvelope<VoteMessage | EthSigVoteMessage>,
  ) {
    const { address, data } = envelope;
    const { votingStrategies, proposalVotes } = data.message;

    const votingStrategyParams = await this.getVotingStrategyParams(strategiesAddresses, envelope);
    return getTimedFundingRoundVoteCalldata(
      address,
      proposalVotes,
      votingStrategies,
      votingStrategyParams,
    );
  }

  public async getVotingStrategyAddresses(
    envelope: TimedFundingRoundEnvelope<VoteMessage | EthSigVoteMessage>,
  ) {
    const votingStrategyHashes = await Promise.all(
      envelope.data.message.votingStrategies.map(index =>
        this.starkProvider.getStorageAt(
          envelope.data.message.houseStrategy,
          encoding.getStorageVarAddress('voting_strategy_hashes_store', index.toString(16)),
        ),
      ),
    );
    const votingStrategyAddresses = await Promise.all(
      votingStrategyHashes.map(async strategyHash => {
        const { result } = await this.starkProvider.callContract({
          contractAddress: VOTING_STRATEGY_REGISTRY_ADDRESS,
          entrypoint: hash.getSelectorFromName('get_voting_strategy'),
          calldata: [strategyHash],
        });
        return result[0];
      }),
    );
    return votingStrategyAddresses;
  }

  public async getVotingStrategyParams(
    strategiesAddresses: string[],
    envelope: TimedFundingRoundEnvelope,
  ) {
    return Promise.all(
      strategiesAddresses.map((address, index) => {
        const votingStrategy = this.votingStrategies.get(address);
        if (!votingStrategy) {
          throw new Error(`Invalid voting strategy: ${address}`);
        }
        return votingStrategy.getParams(address, index, envelope, {
          ethUrl: this.ethUrl,
          starkProvider: this.starkProvider,
        });
      }),
    );
  }
}
