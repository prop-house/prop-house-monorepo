import { BigNumber } from '@ethersproject/bignumber';
import {
  Custom,
  RoundType,
  Infinite,
  RoundChainConfig,
  GetRoundStateParams,
  RoundState,
} from '../../types';
import { InfiniteRound__factory } from '@prophouse/protocol';
import { encoding, intsSequence, splitUint256 } from '../../utils';
import { isAddress } from '@ethersproject/address';
import { defaultAbiCoder } from '@ethersproject/abi';
import { ADDRESS_ONE } from '../../constants';
import { Account, hash } from 'starknet';
import { Time, TimeUnit } from 'time-ts';
import { RoundBase } from './base';

export class InfiniteRound<CS extends void | Custom = void> extends RoundBase<RoundType.INFINITE, CS> {
  // Storage variable name helpers
  protected readonly _SPENT_VOTING_POWER_STORE = 'spent_voting_power_store';
  protected readonly _ROUND_TIMESTAMPS_STORE = 'round_timestamps_store';

  /**
   * The `RoundConfig` struct type
   */
  // prettier-ignore
  public static CONFIG_STRUCT_TYPE = `
    tuple(
      uint248 proposalThreshold,
      uint256[] proposingStrategies,
      uint256[] proposingStrategyParamsFlat,
      uint256[] votingStrategies,
      uint256[] votingStrategyParamsFlat,
      uint40 startTimestamp,
      uint40 votePeriodDuration,
      uint248 quorumFor,
      uint248 quorumAgainst
  )`;

  /**
   * The minimum vote period duration
   */
  public static MIN_VOTE_PERIOD_DURATION = Time.toSeconds(1, TimeUnit.Days);

  /**
   * EIP712 infinite round types
   */
  public static readonly EIP_712_TYPES = {
    ...super.EIP_712_TYPES,
    ProposalVote: [
      { name: 'proposalId', type: 'uint32' },
      { name: 'proposalVersion', type: 'uint16' },
      { name: 'votingPower', type: 'uint256' },
      { name: 'direction', type: 'uint8' },
    ],
    Propose: [
      { name: 'authStrategy', type: 'bytes32' },
      { name: 'round', type: 'bytes32' },
      { name: 'proposer', type: 'address' },
      { name: 'metadataUri', type: 'string' },
      { name: 'requestedAssets', type: 'Asset[]' },
      { name: 'usedProposingStrategies', type: 'UserStrategy[]' },
      { name: 'salt', type: 'uint256' },
    ],
    EditProposal: [
      { name: 'authStrategy', type: 'bytes32' },
      { name: 'round', type: 'bytes32' },
      { name: 'proposer', type: 'address' },
      { name: 'proposalId', type: 'uint32' },
      { name: 'requestedAssets', type: 'Asset[]' },
      { name: 'metadataUri', type: 'string' },
      { name: 'salt', type: 'uint256' },
    ],
    CancelProposal: [
      { name: 'authStrategy', type: 'bytes32' },
      { name: 'round', type: 'bytes32' },
      { name: 'proposer', type: 'address' },
      { name: 'proposalId', type: 'uint32' },
      { name: 'salt', type: 'uint256' },
    ],
    Vote: [
      { name: 'authStrategy', type: 'bytes32' },
      { name: 'round', type: 'bytes32' },
      { name: 'voter', type: 'address' },
      { name: 'proposalVotes', type: 'ProposalVote[]' },
      { name: 'usedVotingStrategies', type: 'UserStrategy[]' },
      { name: 'salt', type: 'uint256' },
    ],
  };

  /**
   * Returns a `InfiniteRound` instance for the provided chain configuration
   * @param config The chain config
   */
  public static for<CS extends void | Custom = void>(config: RoundChainConfig<CS>) {
    return new InfiniteRound<CS>(config);
  }

  /**
   * Given the provided params, return the round state
   * @param _params The information required to get the round state
   */
  public static getState(_params: GetRoundStateParams<RoundType.INFINITE>): RoundState {
    throw new Error('Method not implemented.');
  }

  /**
   * The Starknet relayer path
   */
  public get relayerPath() {
    return 'infinite_round';
  }

  /**
   * The round type
   */
  public get type() {
    return RoundType.INFINITE as const;
  }

  /**
   * The round implementation contract address
   */
  public get impl() {
    return this._addresses.evm.round.infinite;
  }

  /**
   * The round implementation contract interface
   */
  public get interface() {
    return InfiniteRound__factory.createInterface();
  }

  /**
   * Convert the provided round configuration to a config struct
   * @param config The infinite round config
   */
  public async getConfigStruct(config: Infinite.Config<CS>): Promise<Infinite.ConfigStruct> {
    if (config.votePeriodDurationSecs < InfiniteRound.MIN_VOTE_PERIOD_DURATION) {
      throw new Error('Vote period duration is too short');
    }
    if (BigNumber.from(config.quorumFor).isZero()) {
      throw new Error('No FOR quorum provided');
    }
    if (BigNumber.from(config.quorumAgainst).isZero()) {
      throw new Error('No AGAINST quorum provided');
    }
    const proposalThreshold = BigNumber.from(config.proposalThreshold ?? 0);
    if (proposalThreshold.gt(0) && !config.proposingStrategies?.length) {
      throw new Error('Round must have at least one proposing strategy when threshold is non-zero');
    }
    if (config.votingStrategies.length == 0) {
      throw new Error('Round must have at least one voting strategy');
    }

    const [proposingStrategies, votingStrategies] = await Promise.all([
      Promise.all(
        (config.proposingStrategies ?? []).map(s => this._govPower.getStrategyAddressAndParams(s)),
      ),
      Promise.all(config.votingStrategies.map(s => this._govPower.getStrategyAddressAndParams(s))),
    ]);

    return {
      proposalThreshold,
      proposingStrategies: proposingStrategies.map(s => s.address),
      proposingStrategyParamsFlat: encoding.flatten2DArray(proposingStrategies.map(s => s.params)),
      votingStrategies: votingStrategies.map(s => s.address),
      votingStrategyParamsFlat: encoding.flatten2DArray(votingStrategies.map(s => s.params)),
      startTimestamp: config.startUnixTimestamp,
      votePeriodDuration: config.votePeriodDurationSecs,
      quorumFor: config.quorumFor,
      quorumAgainst: config.quorumAgainst,
    };
  }

  /**
   * Estimate the round registration message fee cost (in wei)
   * @param configStruct The round configuration struct
   */
  public async estimateMessageFee(configStruct: Infinite.ConfigStruct) {
    const rawPayload = await this.getContract(this.impl).getRegistrationPayload(configStruct);
    const payload = [
      encoding.hexPadLeft(ADDRESS_ONE).toLowerCase(),
      ...rawPayload.slice(1).map(p => p.toString()),
    ];
    payload[4] = configStruct.startTimestamp.toString();
    payload[5] = configStruct.votePeriodDuration.toString();
    payload[6] = configStruct.quorumFor.toString();
    payload[7] = configStruct.quorumAgainst.toString();

    payload[8] = configStruct.proposalThreshold.toString();

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
   * ABI-encode the infinite round configuration
   * @param config The infinite round config
   */
  public encode(configStruct: Infinite.ConfigStruct): string {
    return defaultAbiCoder.encode([InfiniteRound.CONFIG_STRUCT_TYPE], [configStruct]);
  }

  /**
   * Given the provided params, return the round state
   * @param params The information required to get the round state
   */
  public getState(params: GetRoundStateParams<RoundType.INFINITE>) {
    return InfiniteRound.getState(params);
  }

  /**
   * Given a round address, return a `InfiniteRound` contract instance
   * @param address The round address
   */
  public getContract(address: string) {
    return InfiniteRound__factory.connect(address, this._evm);
  }

  /**
   * Sign a propose message and return the proposer, signature, and signed message
   * @param config The round address and proposal metadata URI
   */
  public async signProposeMessage(config: Infinite.ProposeConfig) {
    const address = await this.signer.getAddress();
    if (isAddress(config.round)) {
      // If the origin chain round is provided, fetch the Starknet round address
      config.round = await this._query.getStarknetRoundAddress(config.round);
    }

    const message = {
      round: encoding.hexPadLeft(config.round),
      metadataUri: config.metadataUri,
      proposer: address,
      authStrategy: encoding.hexPadLeft(this._addresses.starknet.auth.infinite.sig),
      requestedAssets: encoding.compressAssets(config.requestedAssets).map(([assetId, amount]) => ({
        assetId,
        amount,
      })),
      usedProposingStrategies: [], // TODO: Add SDK support for proposing strategies
      salt: this.generateSalt(),
    };
    const signature = await this.signer._signTypedData(
      this.DOMAIN,
      this.pick(InfiniteRound.EIP_712_TYPES, ['Propose', 'UserStrategy', 'Asset']),
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
  public async proposeViaSignature(config: Infinite.ProposeConfig) {
    const { address, signature, message } = await this.signProposeMessage(config);
    return this.sendToRelayer<Infinite.RequestParams>({
      address,
      signature,
      action: Infinite.Action.PROPOSE,
      data: message,
    });
  }

  /**
   * Sign proposal votes and return the voter, signature, and signed message
   * @param config The round address and proposal vote(s)
   */
  public async signVoteMessage(config: Infinite.VoteConfig) {
    const address = await this.signer.getAddress();
    const suppliedVotingPower = config.votes.reduce(
      (acc, { votingPower }) => acc.add(votingPower),
      BigNumber.from(0),
    );
    if (suppliedVotingPower.eq(0)) {
      throw new Error('Must vote on at least one proposal');
    }
    const { govPowerStrategies } = await this._query.getRoundVotingStrategies(config.round);

    if (isAddress(config.round)) {
      // If the origin chain round is provided, fetch the Starknet round address
      config.round = await this._query.getStarknetRoundAddress(config.round);
    }
    const timestamp = await this.getSnapshotTimestamp(config.round);
    const nonZeroStrategyVotingPowers = await this._govPower.getPowerForStrategies(
      address,
      timestamp,
      govPowerStrategies,
    );
    const totalVotingPower = nonZeroStrategyVotingPowers.reduce(
      (acc, { govPower }) => acc.add(govPower),
      BigNumber.from(0),
    );
    const spentVotingPower = await this.getSpentVotingPower(config.round, address);
    const remainingVotingPower = totalVotingPower.sub(spentVotingPower);
    if (suppliedVotingPower.gt(remainingVotingPower)) {
      throw new Error('Not enough voting power remaining');
    }

    const userParams = await this._govPower.getUserParamsForStrategies(
      address,
      timestamp,
      nonZeroStrategyVotingPowers.map(s => s.strategy),
    );
    const message = {
      round: encoding.hexPadLeft(config.round),
      voter: address,
      proposalVotes: config.votes,
      authStrategy: encoding.hexPadLeft(this._addresses.starknet.auth.infinite.sig),
      usedVotingStrategies: nonZeroStrategyVotingPowers.map(({ strategy }, i) => ({
        id: strategy.id,
        userParams: userParams[i],
      })),
      salt: this.generateSalt(),
    };
    const signature = await this.signer._signTypedData(
      this.DOMAIN,
      this.pick(InfiniteRound.EIP_712_TYPES, ['Vote', 'ProposalVote', 'UserStrategy']),
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
  public async voteViaSignature(config: Infinite.VoteConfig) {
    const { address, signature, message } = await this.signVoteMessage(config);
    return this.sendToRelayer<Infinite.RequestParams>({
      address,
      signature,
      action: Infinite.Action.VOTE,
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
    params: Omit<Infinite.RequestParams<Infinite.Action.PROPOSE>, 'action'>,
  ) {
    const payload = {
      ...params,
      action: Infinite.Action.PROPOSE,
    };
    const call = this.createEVMSigAuthCall(payload, 'authenticate_propose', this.getProposeCalldata(params.data));
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
    params: Omit<Infinite.RequestParams<Infinite.Action.VOTE>, 'action'>,
  ) {
    const payload = {
      ...params,
      action: Infinite.Action.VOTE,
    };

    // TODO: Avoid calling these twice...
    const timestamp = await this.getSnapshotTimestamp(params.data.round);
    const { govPowerStrategies } = await this._query.getGovPowerStrategies({
      where: {
        id_in: params.data.usedVotingStrategies.map(({ id }) => id),
      },
    });

    // TODO: We only need to do this if they haven't voted before.
    // Remove asap.
    const preCalls = await this._govPower.getPreCallsForStrategies(
      params.data.voter,
      timestamp,
      govPowerStrategies,
    );

    const call = this.createEVMSigAuthCall(payload, 'authenticate_vote', this.getVoteCalldata(params.data));
    const fee = await account.estimateFee([...preCalls, call]);
    return account.execute([...preCalls, call], undefined, {
      maxFee: fee.suggestedMaxFee,
    });
  }

  /**
   * Generates a calldata array used to submit a proposal through an authenticator
   * @param config The information required to generate the propose calldata
   */
  public getProposeCalldata(config: Infinite.ProposeCalldataConfig): string[] {
    const metadataUri = intsSequence.IntsSequence.LEFromString(config.metadataUri);
    return [
      config.proposer,
      `0x${metadataUri.values.length.toString(16)}`,
      ...metadataUri.values,
      `0x${config.requestedAssets.length.toString(16)}`,
      ...config.requestedAssets.map(a => {
        const id = splitUint256.SplitUint256.fromUint(BigNumber.from(a.assetId).toBigInt());
        const amount = splitUint256.SplitUint256.fromUint(BigNumber.from(a.amount).toBigInt());
        return [id.low, id.high, amount.low, amount.high];
      }).flat(),
      `0x${config.usedProposingStrategies.length.toString(16)}`,
      ...config.usedProposingStrategies.flatMap(({ id, userParams }) => 
        [id, userParams.length, ...userParams],
      ).map(v => v.toString()),
    ];
  }

  /**
   * Generates a calldata array used to cast a vote through an authenticator
   * @param config The information required to generate the vote calldata
   */
  public getVoteCalldata(config: Infinite.VoteCalldataConfig): string[] {
    return [
      config.voter,
      `0x${config.proposalVotes.length.toString(16)}`,
      ...config.proposalVotes.flatMap(({ proposalId, proposalVersion, votingPower, direction }) => {
        const p = splitUint256.SplitUint256.fromUint(BigInt(votingPower.toString()));
        return [proposalId, proposalVersion, p.low, p.high, direction];
      }),
      `0x${config.usedVotingStrategies.length.toString(16)}`,
      ...config.usedVotingStrategies.flatMap(({ id, userParams }) => 
        [id, userParams.length, ...userParams],
      ),
    ].map(v => v.toString());
  }

  /**
   * Create an EVM sig auth call using the provided parameters and calldata
   * @param params The request parameters
   * @param entrypoint The function selector
   * @param calldata Calldata specific to the entrypoint
   */
  public createEVMSigAuthCall(params: Infinite.RequestParams, entrypoint: string, calldata: (string | number)[]) {
    const { round, authStrategy, salt } = params.data;
    const { r, s, v } = encoding.getRSVFromSig(params.signature);
    const rawSalt = splitUint256.SplitUint256.fromHex(`0x${salt.toString(16)}`);
    return {
      contractAddress: authStrategy,
      entrypoint,
      calldata: [
        r.low,
        r.high,
        s.low,
        s.high,
        v,
        rawSalt.low,
        rawSalt.high,
        round,
        ...calldata,
      ],
    };
  }

  /**
   * Get the snapshot block timestamp for the provided round
   * @param round The Starknet round address
   */
  public async getSnapshotTimestamp(round: string): Promise<string> {
    const roundTimestamps = await this._starknet.getStorageAt(
      round,
      encoding.getStorageVarAddress(this._ROUND_TIMESTAMPS_STORE),
    );
    return BigNumber.from(roundTimestamps).shr(40).mask(40).toString();
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
}
