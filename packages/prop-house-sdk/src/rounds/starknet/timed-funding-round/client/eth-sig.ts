import { hash, Provider } from 'starknet';
import { bytes, encoding, splitUint256 } from '../../../../utils';
import { VotingStrategy } from '../../../../types';
import {
  DOMAIN as domain,
  TIMED_FUNDING_ROUND_PROPOSE_TYPES as proposeTypes,
  TIMED_FUNDING_ROUND_VOTE_TYPES as voteTypes,
  VOTING_STRATEGY_REGISTRY_ADDRESS,
} from '../constants';
import { TypedDataField } from '@ethersproject/abstract-signer';
import { Web3Provider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { Wallet } from '@ethersproject/wallet';
import { DEFAULT_VOTING_STRATEGIES } from '../voting';
import randomBytes from 'randombytes';
import {
  EthSigProposeMessage,
  EthSigVoteMessage,
  ProposeMessage,
  TimedFundingRoundAction,
  TimedFundingRoundEnvelope,
  TimedFundingRoundEthSigClientConfig,
  TimedFundingRoundSignatureMessage,
  VoteMessage,
} from '../types';

export class TimedFundingRoundEthSigClient {
  public readonly ethUrl: string;
  public readonly starkProvider: Provider;
  public readonly starknetRelayerUrl: string;
  public readonly votingStrategies: Map<string, VotingStrategy<TimedFundingRoundEnvelope>>;

  constructor(config: TimedFundingRoundEthSigClientConfig) {
    this.ethUrl = config.ethUrl;
    this.starkProvider = config.starkProvider;
    this.starknetRelayerUrl = config.starknetRelayerUrl;
    this.votingStrategies = new Map(
      Object.entries({
        ...DEFAULT_VOTING_STRATEGIES,
        ...(config.votingStrategies || {}),
      }).map(([a, s]) => [encoding.hexPadRight(a).toLowerCase(), s]),
    );
  }

  /**
   * Generate the salt that's included in the signed message
   */
  public generateSalt() {
    return Number(splitUint256.SplitUint256.fromHex(bytes.bytesToHex(randomBytes(4))).toHex());
  }

  /**
   * Sign the passed message using the passed web3 provider
   * @param web3 The web3 provider or wallet
   * @param message The message that will be signed
   * @param types The signed message types
   */
  public async sign<T extends TimedFundingRoundSignatureMessage>(
    web3: Web3Provider | Wallet,
    message: T,
    types: Record<string, Array<TypedDataField>>,
  ): Promise<string> {
    const signer = Wallet.isSigner(web3) ? web3 : web3.getSigner();
    return signer._signTypedData(domain, types, message);
  }

  /**
   * Send a signed message envelope to the Starknet relayer
   * @param envelope The timed funding round message envelope
   */
  public async send(envelope: TimedFundingRoundEnvelope) {
    const res = await fetch(this.starknetRelayerUrl, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'send',
        params: { envelope },
        id: null,
      }),
    });
    const json = await res.json();
    return json.result;
  }

  /**
   * Generate a propose message, sign it, and return the signed message envelope
   * @param web3 The web3 provider or wallet
   * @param address The signer address
   * @param data The propose message data
   */
  public async propose(
    web3: Web3Provider | Wallet,
    address: string,
    data: ProposeMessage,
  ): Promise<TimedFundingRoundEnvelope<EthSigProposeMessage>> {
    const message: EthSigProposeMessage = {
      ...data,
      round: encoding.hexPadRight(data.round),
      authStrategy: encoding.hexPadRight(data.authStrategy),
      proposerAddress: encoding.hexPadRight(address),
      salt: this.generateSalt(),
    };
    const signature = await this.sign(web3, message, proposeTypes);
    return {
      address,
      signature,
      data: {
        action: TimedFundingRoundAction.Propose,
        message,
      },
    };
  }

  /**
   * Generate a vote message, sign it, and return the signed message envelope
   * @param web3 The web3 provider or wallet
   * @param address The signer address
   * @param data The vote message data
   */
  public async vote(web3: Web3Provider | Wallet, address: string, data: VoteMessage) {
    const votingStrategyAddresses = await this.getVotingStrategyAddresses(data);
    const votingStrategyParams = await this.getVotingStrategyParams(votingStrategyAddresses, data);
    const proposalVotesHash = encoding.hexPadRight(
      hash.computeHashOnElements(
        data.proposalVotes
          .map(vote => {
            const { low, high } = splitUint256.SplitUint256.fromUint(
              BigInt(vote.votingPower.toString()),
            );
            return [
              `0x${vote.proposalId.toString(16)}`,
              BigNumber.from(low).toHexString(),
              BigNumber.from(high).toHexString(),
            ];
          })
          .flat(),
      ),
    );
    const message: EthSigVoteMessage = {
      round: encoding.hexPadRight(data.round),
      authStrategy: encoding.hexPadRight(data.authStrategy),
      voterAddress: encoding.hexPadRight(address),
      proposalVotesHash: encoding.hexPadRight(proposalVotesHash),
      votingStrategiesHash: encoding.hexPadRight(
        hash.computeHashOnElements(data.votingStrategyIds),
      ),
      votingStrategyParamsHash: encoding.hexPadRight(
        hash.computeHashOnElements(encoding.flatten2DArray(votingStrategyParams)),
      ),
      salt: this.generateSalt(),
    };
    const signature = await this.sign(web3, message, voteTypes);
    return {
      address,
      signature,
      data: {
        action: TimedFundingRoundAction.Vote,
        message,
      },
    };
  }

  /**
   * Get the voting strategy addresses for the provided vote message
   * @param data The vote message data
   */
  public async getVotingStrategyAddresses(data: VoteMessage) {
    const votingStrategiesRegistered = await Promise.all(
      data.votingStrategyIds.map(id =>
        this.starkProvider.getStorageAt(
          data.round,
          encoding.getStorageVarAddress('registered_voting_strategies_store', id),
        ),
      ),
    );
    if (votingStrategiesRegistered.some(isRegistered => BigNumber.from(isRegistered).eq(0))) {
      throw new Error('Attempted use of an unregistered voting strategy');
    }

    const votingStrategyAddresses = await Promise.all(
      data.votingStrategyIds.map(async strategyId => {
        const { result } = await this.starkProvider.callContract({
          contractAddress: VOTING_STRATEGY_REGISTRY_ADDRESS,
          entrypoint: hash.getSelectorFromName('get_voting_strategy'),
          calldata: [strategyId],
        });
        return result[0];
      }),
    );
    return votingStrategyAddresses;
  }

  /**
   * Get the voting strategy params for the provided strategy addresses
   * @param strategyAddresses The used voting strategy addresses
   * @param data The vote message data
   */
  public async getVotingStrategyParams(strategyAddresses: string[], data: VoteMessage) {
    return Promise.all(
      strategyAddresses.map((address, index) => {
        const votingStrategy = this.votingStrategies.get(address);
        if (!votingStrategy) {
          throw new Error(`Invalid voting strategy: ${address}`);
        }
        return votingStrategy.getParams(
          address,
          index,
          {
            address,
            signature: '',
            data: {
              action: TimedFundingRoundAction.Vote,
              message: data,
            },
          },
          {
            ethUrl: this.ethUrl,
            starkProvider: this.starkProvider,
          },
        );
      }),
    );
  }
}
