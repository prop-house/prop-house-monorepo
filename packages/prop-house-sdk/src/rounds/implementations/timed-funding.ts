import { BigNumber } from '@ethersproject/bignumber';
import { AssetType, Custom, RoundType, TimedFunding, RoundChainConfig } from '../../types';
import { TimedFundingRound__factory } from '@prophouse/contracts';
import { encoding, intsSequence, splitUint256 } from '../../utils';
import { defaultAbiCoder } from '@ethersproject/abi';
import { ADDRESS_ONE } from '../../constants';
import { Account, hash } from 'starknet';
import { Time, TimeUnit } from 'time-ts';
import { RoundBase } from './base';

export class TimedFundingRound<CS extends void | Custom = void> extends RoundBase<
  RoundType.TIMED_FUNDING,
  CS
> {
  // Storage variable name helpers
  protected readonly _SPENT_VOTING_POWER_STORE = 'spent_voting_power_store';
  protected readonly _PROPOSAL_PERIOD_END_TIMESTAMP_STORE = 'proposal_period_end_timestamp_store';

  /**
   * The `RoundConfig` struct type
   */
  // prettier-ignore
  public static CONFIG_STRUCT_TYPE = `
    tuple(
      tuple(
        uint8 assetType,
        address token,
        uint256 identifier,
        uint256 amount
      )[] awards,
      uint256[] votingStrategies,
      uint256[] votingStrategyParamsFlat,
      uint40 proposalPeriodStartTimestamp,
      uint40 proposalPeriodDuration,
      uint40 votePeriodDuration,
      uint16 winnerCount
  )`;

  /**
   * The minimum proposal submission period duration
   */
  public static MIN_PROPOSAL_PERIOD_DURATION = Time.toSeconds(1, TimeUnit.Days);

  /**
   * The minimum vote period duration
   */
  public static MIN_VOTE_PERIOD_DURATION = Time.toSeconds(1, TimeUnit.Days);

  /**
   * Maximum winner count for this strategy
   */
  public static MAX_WINNER_COUNT = 256;

  /**
   * EIP712 timed funding round propose types
   */
  public static PROPOSE_TYPES = {
    Propose: [
      { name: 'authStrategy', type: 'bytes32' },
      { name: 'round', type: 'bytes32' },
      { name: 'proposerAddress', type: 'address' },
      { name: 'metadataUri', type: 'string' },
      { name: 'salt', type: 'uint256' },
    ],
  };

  /**
   * EIP712 timed funding round vote types
   */
  public static VOTE_TYPES = {
    Vote: [
      { name: 'authStrategy', type: 'bytes32' },
      { name: 'round', type: 'bytes32' },
      { name: 'voterAddress', type: 'address' },
      { name: 'proposalVotesHash', type: 'bytes32' },
      { name: 'votingStrategiesHash', type: 'bytes32' },
      { name: 'votingStrategyParamsHash', type: 'bytes32' },
      { name: 'salt', type: 'uint256' },
    ],
  };

  /**
   * Returns a `TimedFundingRound` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for<CS extends void | Custom = void>(config: RoundChainConfig<CS>) {
    return new TimedFundingRound<CS>(config);
  }

  /**
   * The round type
   */
  public get type() {
    return RoundType.TIMED_FUNDING;
  }

  /**
   * The round implementation contract address
   */
  public get impl() {
    return this._addresses.evm.round.timedFunding;
  }

  /**
   * The round implementation contract interface
   */
  public get interface() {
    return TimedFundingRound__factory.createInterface();
  }

  /**
   * Convert the provided round configuration to a config struct
   * @param config The timed funding round config
   */
  public async getConfigStruct(
    config: TimedFunding.Config<CS>,
  ): Promise<TimedFunding.ConfigStruct> {
    const now = Math.floor(Date.now() / 1000);

    // prettier-ignore
    if (config.proposalPeriodStartUnixTimestamp + config.proposalPeriodDurationSecs < now + TimedFundingRound.MIN_PROPOSAL_PERIOD_DURATION) {
      throw new Error('Remaining proposal period duration is too short');
    }
    if (config.votePeriodDurationSecs < TimedFundingRound.MIN_VOTE_PERIOD_DURATION) {
      throw new Error('Vote period duration is too short');
    }
    if (config.winnerCount == 0) {
      throw new Error('Round must have at least one winner');
    }
    if (config.winnerCount > TimedFundingRound.MAX_WINNER_COUNT) {
      throw new Error(
        `Winner count too high. Maximum winners: ${TimedFundingRound.MAX_WINNER_COUNT}. Got: ${config.winnerCount}.`,
      );
    }
    if (config.awards.length !== 1 && config.awards.length !== config.winnerCount) {
      throw new Error(
        `Must specify a single award asset to split or one asset per winner. Winners: ${config.winnerCount}. Awards: ${config.awards.length}.`,
      );
    }
    if (config.awards.length === 1 && config.winnerCount > 1) {
      if (config.awards[0].assetType === AssetType.ERC721) {
        throw new Error(`Cannot split ERC721 between multiple winners`);
      }
      // prettier-ignore
      if (!BigNumber.from(config.awards[0].amount).mod(config.winnerCount).eq(0)) {
        throw new Error(`Award must split equally between winners`);
      }
    }
    if (config.strategies.length == 0) {
      throw new Error('Round must have at least one voting strategy');
    }
    const strategies = await Promise.all(
      config.strategies.map(s => this._voting.getStrategyAddressAndParams(s)),
    );

    return {
      awards: config.awards.map(award => encoding.getAssetStruct(award)),
      votingStrategies: strategies.map(s => s.address),
      votingStrategyParamsFlat: encoding.flatten2DArray(strategies.map(s => s.params)),
      proposalPeriodStartTimestamp: config.proposalPeriodStartUnixTimestamp,
      proposalPeriodDuration: config.proposalPeriodDurationSecs,
      votePeriodDuration: config.votePeriodDurationSecs,
      winnerCount: config.winnerCount,
    };
  }

  /**
   * Estimate the round registration message fee cost (in wei)
   * @param configStruct The round configuration struct
   */
  public async estimateMessageFee(configStruct: TimedFunding.ConfigStruct) {
    const rawPayload = await this.getContract(this.impl).getL2Payload(configStruct);
    const payload = [
      encoding.hexPadLeft(ADDRESS_ONE).toLowerCase(),
      ...rawPayload.slice(1).map(p => p.toString()),
    ];
    payload[5] = configStruct.proposalPeriodStartTimestamp.toString();
    payload[6] = configStruct.proposalPeriodDuration.toString();
    payload[7] = configStruct.votePeriodDuration.toString();
    payload[8] = configStruct.winnerCount.toString();

    const response = (await this._starknet.estimateMessageFee({
      from_address: this._addresses.evm.messenger,
      to_address: this._addresses.starknet.roundFactory,
      entry_point_selector: hash.getSelectorFromName('register_round'),
      payload: payload.map(p => p.toString()),
    })) as unknown as { overall_fee: number; unit: string };
    if (!response.overall_fee || response.unit !== 'wei') {
      throw new Error(`Unexpected message fee response: ${response}`);
    }
    return response.overall_fee.toString();
  }

  /**
   * ABI-encode the timed funding round configuration
   * @param config The timed funding round config
   */
  public encode(configStruct: TimedFunding.ConfigStruct): string {
    return defaultAbiCoder.encode([TimedFundingRound.CONFIG_STRUCT_TYPE], [configStruct]);
  }

  /**
   * Given a round address, return a `TimedFundingRound` contract instance
   * @param address The round address
   */
  public getContract(address: string) {
    return TimedFundingRound__factory.connect(address, this._evm);
  }

  /**
   * Sign a propose message and return the proposer, signature, and signed message
   * @param config The round address and proposal metadata URI
   */
  public async signProposeMessage(config: TimedFunding.ProposeConfig) {
    const address = await this.signer.getAddress();
    const message = {
      round: encoding.hexPadLeft(config.round),
      metadataUri: config.metadataUri,
      proposerAddress: address,
      authStrategy: encoding.hexPadLeft(this._addresses.starknet.auth.timedFundingEthSig),
      salt: this.generateSalt(),
    };
    const signature = await this.signer._signTypedData(
      this.DOMAIN,
      TimedFundingRound.PROPOSE_TYPES,
      message,
    );
    return {
      address,
      signature,
      message,
    };
  }

  /**
   * Sign a propose message and submit it to the Starknet relayer
   * @param config The round address and proposal metadata URI
   */
  public async proposeViaSignature(config: TimedFunding.ProposeConfig) {
    const { address, signature, message } = await this.signProposeMessage(config);
    return this.sendToRelayer<TimedFunding.RequestParams>({
      address,
      signature,
      action: TimedFunding.Action.Propose,
      data: message,
    });
  }

  /**
   * Sign proposal votes and return the voter, signature, and signed message
   * @param config The round address and proposal vote(s)
   */
  public async signVoteMessage(config: TimedFunding.VoteConfig) {
    const address = await this.signer.getAddress();
    const suppliedVotingPower = config.votes.reduce(
      (acc, { votingPower }) => acc.add(votingPower),
      BigNumber.from(0),
    );
    if (suppliedVotingPower.eq(0)) {
      throw new Error('Must vote on at least one proposal');
    }

    const { votingStrategies } = await this._query.getRoundVotingStrategies(config.round);
    const timestamp = await this.getSnapshotTimestamp(config.round);
    const nonZeroStrategyVotingPowers = await this._voting.getVotingPowerForStrategies(
      address,
      timestamp,
      votingStrategies,
    );
    const totalVotingPower = nonZeroStrategyVotingPowers.reduce(
      (acc, { votingPower }) => acc.add(votingPower),
      BigNumber.from(0),
    );
    const spentVotingPower = await this.getSpentVotingPower(config.round, address);
    const remainingVotingPower = totalVotingPower.sub(spentVotingPower);
    if (suppliedVotingPower.gt(remainingVotingPower)) {
      throw new Error('Not enough voting power remaining');
    }

    const userParams = await this._voting.getUserParamsForStrategies(
      address,
      timestamp,
      nonZeroStrategyVotingPowers.map(s => s.strategy),
    );
    const votingStrategyIds = nonZeroStrategyVotingPowers.map(({ strategy }) => strategy.id);
    const message = {
      round: encoding.hexPadLeft(config.round),
      votingStrategyIds,
      proposalVotes: config.votes,
      votingStrategyParams: userParams,
      authStrategy: encoding.hexPadLeft(this._addresses.starknet.auth.timedFundingEthSig),
      voterAddress: address,
      proposalVotesHash: encoding.hexPadRight(this.hashProposalVotes(config.votes)),
      votingStrategiesHash: encoding.hexPadRight(hash.computeHashOnElements(votingStrategyIds)),
      votingStrategyParamsHash: encoding.hexPadRight(
        hash.computeHashOnElements(encoding.flatten2DArray(userParams)),
      ),
      salt: this.generateSalt(),
    };
    const signature = await this.signer._signTypedData(
      this.DOMAIN,
      TimedFundingRound.VOTE_TYPES,
      message,
    );
    return {
      address,
      message,
      signature,
    };
  }

  /**
   * Sign proposal votes and submit them to the Starknet relayer
   * @param config The round address and proposal vote(s)
   */
  public async voteViaSignature(config: TimedFunding.VoteConfig) {
    const { address, signature, message } = await this.signVoteMessage(config);
    return this.sendToRelayer<TimedFunding.RequestParams>({
      address,
      signature,
      action: TimedFunding.Action.Vote,
      data: message,
    });
  }

  /**
   * Relay a signed propose payload to Starknet
   * @param account The Starknet account used to submit the transaction
   * @param params The propose request params
   */
  public async relaySignedProposePayload(
    account: Account,
    params: Omit<TimedFunding.RequestParams<TimedFunding.Action.Propose>, 'action'>,
  ) {
    const payload = {
      ...params,
      action: TimedFunding.Action.Propose,
    };
    const calldata = this.getProposeCalldata({
      proposer: payload.address,
      metadataUri: payload.data.metadataUri,
    });
    const call = this.createEVMSigAuthCall(payload, hash.getSelectorFromName('propose'), calldata);
    const fee = await account.estimateFee(call);
    return account.execute(call, undefined, {
      maxFee: fee.suggestedMaxFee,
    });
  }

  /**
   * Relay a signed vote payload to Starknet
   * @param account The Starknet account used to submit the transaction
   * @param params The vote request params
   */
  public async relaySignedVotePayload(
    account: Account,
    params: Omit<TimedFunding.RequestParams<TimedFunding.Action.Vote>, 'action'>,
  ) {
    const payload = {
      ...params,
      action: TimedFunding.Action.Vote,
    };
    const calldata = this.getVoteCalldata({
      voter: params.address,
      ...params.data,
    });
    const call = this.createEVMSigAuthCall(payload, hash.getSelectorFromName('vote'), calldata);
    const fee = await account.estimateFee(call);
    return account.execute(call, undefined, {
      maxFee: fee.suggestedMaxFee,
    });
  }

  /**
   * Finalize the round by tallying votes and submitting a result via the execution strategy
   * @param account The Starknet account used to submit the transaction
   * @param config The round finalization config
   */
  public async finalizeRound(account: Account, config: TimedFunding.FinalizationConfig) {
    const calldata = [config.awards.length.toString()].concat(
      config.awards.map(a => [a.assetId.low, a.assetId.high, a.amount.low, a.amount.high]).flat(),
    );
    const call = {
      contractAddress: config.round,
      entrypoint: 'finalize_round',
      calldata: calldata,
    };
    const fee = await account.estimateFee(call);
    return account.execute(call, undefined, {
      maxFee: fee.suggestedMaxFee,
    });
  }

  /**
   * Generates a calldata array used to submit a proposal through an authenticator
   * @param config The information required to generate the propose calldata
   */
  public getProposeCalldata(config: TimedFunding.ProposeCalldataConfig): string[] {
    const metadataUri = intsSequence.IntsSequence.LEFromString(config.metadataUri);
    return [
      config.proposer,
      `0x${metadataUri.bytesLength.toString(16)}`,
      `0x${metadataUri.values.length.toString(16)}`,
      ...metadataUri.values,
    ];
  }

  /**
   * Generates a calldata array used to cast a vote through an authenticator
   * @param config The information required to generate the vote calldata
   */
  public getVoteCalldata(config: TimedFunding.VoteCalldataConfig): string[] {
    const { votingStrategyIds, votingStrategyParams, proposalVotes } = config;
    const flattenedVotingStrategyParams = encoding.flatten2DArray(votingStrategyParams);
    const flattenedProposalVotes = proposalVotes
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
      .flat();
    return [
      config.voter,
      `0x${proposalVotes.length.toString(16)}`,
      ...flattenedProposalVotes,
      `0x${votingStrategyIds.length.toString(16)}`,
      ...votingStrategyIds,
      `0x${flattenedVotingStrategyParams.length.toString(16)}`,
      ...flattenedVotingStrategyParams,
    ];
  }

  /**
   * Create an EVM sig auth call using the provided parameters and calldata
   * @param params The request parameters
   * @param selector The function selector
   * @param calldata The transaction calldata
   */
  public createEVMSigAuthCall(
    params: TimedFunding.RequestParams,
    selector: string,
    calldata: string[],
  ) {
    const { round, authStrategy, salt } = params.data;
    const { r, s, v } = encoding.getRSVFromSig(params.signature);
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
  }

  /**
   * Get the snapshot block timestamp for the provided round
   * @param round The Starknet round address
   */
  public async getSnapshotTimestamp(round: string): Promise<string> {
    const snapshotTimestamp = await this._starknet.getStorageAt(
      round,
      encoding.getStorageVarAddress(this._PROPOSAL_PERIOD_END_TIMESTAMP_STORE),
    );
    return BigNumber.from(snapshotTimestamp).toString();
  }

  /**
   * Get the amount of voting power that has already been used by the `voter`
   * @param round The Starknet round address
   * @param voter The voter address
   */
  public async getSpentVotingPower(round: string, voter: string) {
    const key = encoding.getStorageVarAddress(this._SPENT_VOTING_POWER_STORE, voter);
    return BigNumber.from(await this._starknet.getStorageAt(round, key));
  }

  /**
   * Return the pedersen hash of the provided proposal votes
   * @param votes The voting power to allocate to one or more proposals
   */
  protected hashProposalVotes(votes: TimedFunding.ProposalVote[]) {
    return hash.computeHashOnElements(
      votes
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
    );
  }
}
