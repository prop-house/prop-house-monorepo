import { PropHouseContract, PropHouse__factory } from '@prophouse/contracts';
import {
  Asset,
  AssetStruct,
  AssetType,
  Custom,
  HouseInfo,
  HouseType,
  PropHouseConfig,
  RoundInfo,
  RoundType,
} from './types';
import { ContractAddresses, getContractAddressesForChainOrThrow } from './addresses';
import { BigNumber } from '@ethersproject/bignumber';
import { Overrides } from '@ethersproject/contracts';
import { encoding } from './utils';
import { House } from './houses';
import { Round } from './rounds';
import { Voting } from './voting';

export class PropHouse<CVS extends Custom | void = void> {
  private readonly _contract: PropHouseContract;
  private readonly _addresses: ContractAddresses;
  private readonly _house: House;
  private readonly _round: Round;
  private readonly _voting: Voting<CVS>;

  /**
   * The prop house contract instance
   */
  public get contract() {
    return this._contract;
  }

  /**
   * Prop house contract addresses
   */
  public get addresses() {
    return this._addresses;
  }

  /**
   * Shared house helper
   */
  public get house() {
    return this._house;
  }

  /**
   * Shared round helper
   */
  public get round() {
    return this._round;
  }

  /**
   * Shared voting helper
   */
  public get voting() {
    return this._voting;
  }

  constructor(config: PropHouseConfig<CVS>) {
    this._addresses = getContractAddressesForChainOrThrow(config.chainId);
    this._contract = PropHouse__factory.connect(
      this.addresses.evm.prophouse,
      config.signerOrProvider,
    );
    this._house = House.for(config.chainId);
    this._round = Round.for(config.chainId);
    this._voting = Voting.for<CVS>(config.chainId);
  }

  /**
   * Deposit an asset to the provided `round`
   * @param round The address of the round to deposit to
   * @param asset The asset to deposit
   * @param overrides Optional transaction overrides
   */
  public async depositTo(round: string, asset: Asset, overrides: Overrides = {}) {
    return this.contract.depositTo(round, encoding.getAssetStruct(asset), {
      ...overrides,
      value: asset.assetType === AssetType.ETH ? asset.amount : 0,
    });
  }

  /**
   * Deposit one or more assets to the provided `round`
   * @param round The address of the round to deposit to
   * @param assets The assets to deposit
   * @param overrides Optional transaction overrides
   */
  public async batchDepositTo(round: string, assets: Asset[], overrides: Overrides = {}) {
    if (!assets.length) {
      throw new Error('Must provide at least one asset to deposit');
    }
    if (assets.length > 1) {
      const { assets: _assets, value } = this.mergeAssetsAndGetTotalETHValue(assets);
      return this.contract.batchDepositTo(round, _assets, {
        ...overrides,
        value,
      });
    }
    return this.depositTo(round, assets[0], overrides);
  }

  /**
   * Create a new round on an existing house
   * @param houseAddress The house address
   * @param round The round type, title, description, and config
   * @param overrides Optional transaction overrides
   */
  public async createRoundOnExistingHouse<RT extends RoundType>(
    houseAddress: string,
    round: RoundInfo<RT>,
    overrides: Overrides = {},
  ) {
    return this.contract.createRoundOnExistingHouse(
      houseAddress,
      {
        title: round.title,
        description: round.description,
        impl: this.round.getImplForType(round.roundType),
        config: await this.round.getABIEncodedConfig(round),
      },
      overrides,
    );
  }

  /**
   * Create and fully or partially fund a new round on an existing house
   * @param houseAddress The house address
   * @param round The round type, title, description, and config
   * @param funding The assets to fund up-front
   * @param overrides Optional transaction overrides
   */
  public async createAndFundRoundOnExistingHouse<RT extends RoundType>(
    houseAddress: string,
    round: RoundInfo<RT>,
    funding: Asset[],
    overrides: Overrides = {},
  ) {
    const { assets, value } = this.mergeAssetsAndGetTotalETHValue(funding);
    return this.contract.createAndFundRoundOnExistingHouse(
      houseAddress,
      {
        title: round.title,
        description: round.description,
        impl: this.round.getImplForType(round.roundType),
        config: await this.round.getABIEncodedConfig(round),
      },
      assets,
      {
        ...overrides,
        value,
      },
    );
  }

  /**
   * Create a new round on a new house
   * @param house The house type and config
   * @param round The round type, title, description, and config
   * @param overrides Optional transaction overrides
   */
  public async createRoundOnNewHouse<HT extends HouseType, RT extends RoundType>(
    house: HouseInfo<HT>,
    round: RoundInfo<RT>,
    overrides: Overrides = {},
  ) {
    return this.contract.createRoundOnNewHouse(
      {
        impl: this.house.getImplForType(house.houseType),
        config: this.house.getABIEncodedConfig(house),
      },
      {
        title: round.title,
        description: round.description,
        impl: this.round.getImplForType(round.roundType),
        config: await this.round.getABIEncodedConfig(round),
      },
      overrides,
    );
  }

  /**
   * Create and fully or partially fund a new round on a new house
   * @param house The house type and config
   * @param round The round type, title, description, and config
   * @param funding The assets to fund up-front
   * @param overrides Optional transaction overrides
   */
  public async createAndFundRoundOnNewHouse<HT extends HouseType, RT extends RoundType>(
    house: HouseInfo<HT>,
    round: RoundInfo<RT>,
    funding: Asset[],
    overrides: Overrides = {},
  ) {
    const { assets, value } = this.mergeAssetsAndGetTotalETHValue(funding);
    return this.contract.createAndFundRoundOnNewHouse(
      {
        impl: this.house.getImplForType(house.houseType),
        config: this.house.getABIEncodedConfig(house),
      },
      {
        title: round.title,
        description: round.description,
        impl: this.round.getImplForType(round.roundType),
        config: await this.round.getABIEncodedConfig(round),
      },
      assets,
      {
        ...overrides,
        value,
      },
    );
  }

  /**
   * Convert an array of assets to asset structs, merge duplicate
   * assets, and calculate the total ETH value.
   * @param assets The assets to convert and merge
   */
  private mergeAssetsAndGetTotalETHValue(assets: Asset[]) {
    const accumulator: Record<string, AssetStruct> = {};
    for (const asset of assets) {
      const assetID = encoding.getAssetID(asset);
      const struct = encoding.getAssetStruct(asset);

      const prevAmount = accumulator[assetID]?.amount;
      if (prevAmount) {
        struct.amount = BigNumber.from(struct.amount).add(prevAmount);
      }
      accumulator[assetID] = struct;
    }
    return {
      assets: Object.values(accumulator),
      value: accumulator[encoding.getETHAssetID()]?.amount ?? 0,
    };
  }
}
