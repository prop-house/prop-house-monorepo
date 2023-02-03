import { FundingHouseContract } from '@prophouse/contracts';
import { BigNumber, BigNumberish } from '@ethersproject/bignumber';
import { ContractReceipt, Overrides } from '@ethersproject/contracts';
import { getHouseStrategyCalldata } from '../../strategies';
import { /* getAwardsCalldata */ } from './utils';
import {
  PayableFundingHouseAction as PayableAction,
  FundingHouseActionName as ActionName,
  FundingHouseAction as Action,
  RoundParams,
} from './types';

export class FundingHouseBatcher {
  private _actions: Action[] = [];

  /**
   * The batch actions
   */
  public get actions() {
    return this._actions;
  }

  constructor(private readonly _contract: FundingHouseContract) {}

  // /**
  //  * Push an ETH deposit to the actions queue
  //  * @param amount The ETH amount to deposit (in wei)
  //  */
  // public depositETH(amount: BigNumberish) {
  //   if (this._actions.find(a => a.name === ActionName.DepositETH)) {
  //     throw new Error('Only one ETH deposit allowed per batch');
  //   }
  //   this._actions.push({
  //     name: ActionName.DepositETH,
  //     data: this._contract.interface.encodeFunctionData('depositETH'),
  //     value: amount,
  //   });
  //   return this;
  // }

  // /**
  //  * Push a ERC20 deposit to the actions queue
  //  * @param address The ERC20 token address
  //  * @param amount The ERC20 token amount
  //  */
  // public depositERC20(address: string, amount: BigNumberish) {
  //   this._actions.push({
  //     name: ActionName.DepositERC20,
  //     data: this._contract.interface.encodeFunctionData('depositERC20', [address, amount]),
  //   });
  //   return this;
  // }

  // /**
  //  * Push a ERC721 deposit to the actions queue
  //  * @param address The ERC721 token address
  //  * @param tokenId The ERC721 token ID
  //  */
  // public depositERC721(address: string, tokenId: BigNumberish) {
  //   this._actions.push({
  //     name: ActionName.DepositERC721,
  //     data: this._contract.interface.encodeFunctionData('depositERC721', [address, tokenId]),
  //   });
  //   return this;
  // }

  // /**
  //  * Push a ERC1155 deposit to the actions queue
  //  * @param address The ERC1155 token address
  //  * @param tokenId The ERC1155 token ID
  //  * @param amount The ERC1155 token amount
  //  */
  // public depositERC1155(address: string, tokenId: BigNumberish, amount: BigNumberish) {
  //   this._actions.push({
  //     name: ActionName.DepositERC721,
  //     data: this._contract.interface.encodeFunctionData('depositERC1155', [
  //       address,
  //       tokenId,
  //       amount,
  //     ]),
  //   });
  //   return this;
  // }

  // /**
  //  * Push a funding round initiation to the actions queue
  //  * @param round The round initiation parameters
  //  */
  // public initiateRoundSimple(round: RoundParams) {
  //   this._actions.push({
  //     name: ActionName.InitiateRound,
  //     data: this._contract.interface.encodeFunctionData('initiateRound', [
  //       {
  //         title: round.title,
  //         description: round.description,
  //         tags: round.tags,
  //         votingStrategies: round.votingStrategies,
  //         strategy: getHouseStrategyCalldata(round.strategy, round.awards),
  //         awards: getAwardsCalldata(round.awards),
  //       },
  //     ]),
  //   });
  //   return this;
  // }

  // /**
  //  * Clear all actions
  //  */
  // public clear() {
  //   this._actions = [];
  // }

  // /**
  //  * Execute all queued actions in a single transaction
  //  * @param optimize Whether multiple token deposits should be collapsed into a single function call
  //  * @param overrides Optional transaction overrides
  //  */
  // public async execute(optimize = true, overrides: Overrides = {}): Promise<ContractReceipt> {
  //   if (!this._actions.length) {
  //     throw new Error('No actions have been added');
  //   }
  //   const actions = optimize ? this.optimize(this.actions) : this.actions;
  //   const data = actions.map(({ data }) => data);
  //   const transaction = await this._contract.batch(data, {
  //     ...overrides,
  //     value: this.totalValue(actions),
  //   });
  //   this._actions = [];

  //   return transaction.wait();
  // }

  // /**
  //  * Optimize the actions array by consolidating deposits into batch calls, if possible
  //  * @param actions The batch actions
  //  */
  // private optimize(actions: Action[]) {
  //   const erc20 = actions.filter(a => a.name === ActionName.DepositERC20);
  //   const erc721 = actions.filter(a => a.name === ActionName.DepositERC721);
  //   const erc1155 = actions.filter(a => a.name === ActionName.DepositERC1155);

  //   // No calls to optimize. Exit early.
  //   if (![erc20, erc721, erc1155].some(a => a.length > 1)) {
  //     return actions;
  //   }

  //   const optimized = actions.filter(a => {
  //     if (a.name === ActionName.DepositERC20 && erc20.length > 1) {
  //       return false;
  //     }
  //     if (a.name === ActionName.DepositERC721 && erc721.length > 1) {
  //       return false;
  //     }
  //     if (a.name === ActionName.DepositERC1155 && erc1155.length > 1) {
  //       return false;
  //     }
  //     return true;
  //   });

  //   if (erc20.length > 1) {
  //     optimized.unshift({
  //       name: ActionName.BatchDepositERC20,
  //       data: this.aggregateERC20Deposits(erc20),
  //     });
  //   }
  //   if (erc721.length > 1) {
  //     optimized.unshift({
  //       name: ActionName.BatchDepositERC721,
  //       data: this.aggregateERC721Deposits(erc721),
  //     });
  //   }
  //   if (erc1155.length > 1) {
  //     optimized.unshift({
  //       name: ActionName.BatchDepositERC1155,
  //       data: this.aggregateERC1155Deposits(erc1155),
  //     });
  //   }
  //   return optimized;
  // }

  // /**
  //  * Consolidate many ERC20 deposits into a single batch call
  //  * @param erc20 The ERC20 deposit actions
  //  */
  // private aggregateERC20Deposits(erc20: Action[]) {
  //   const data = erc20.reduce<{ addresses: string[]; amounts: BigNumberish[] }>(
  //     (acc, { data }) => {
  //       const [address, amount] = this._contract.interface.decodeFunctionResult(
  //         'depositERC20',
  //         data,
  //       );
  //       acc.addresses.push(address);
  //       acc.amounts.push(amount);
  //       return acc;
  //     },
  //     { addresses: [], amounts: [] },
  //   );
  //   return this._contract.interface.encodeFunctionData('batchDepositERC20', [
  //     data.addresses,
  //     data.amounts,
  //   ]);
  // }

  // /**
  //  * Consolidate many ERC721 deposits into a single batch call
  //  * @param erc721 The ERC721 deposit actions
  //  */
  // private aggregateERC721Deposits(erc721: Action[]) {
  //   const agg = erc721.reduce<{ addresses: string[]; tokenIds: BigNumberish[] }>(
  //     (acc, { data }) => {
  //       const [address, tokenId] = this._contract.interface.decodeFunctionResult(
  //         'depositERC721',
  //         data,
  //       );
  //       acc.addresses.push(address);
  //       acc.tokenIds.push(tokenId);
  //       return acc;
  //     },
  //     { addresses: [], tokenIds: [] },
  //   );
  //   return this._contract.interface.encodeFunctionData('batchDepositERC721', [
  //     agg.addresses,
  //     agg.tokenIds,
  //   ]);
  // }

  // /**
  //  * Consolidate many ERC1155 deposits into a single batch call
  //  * @param erc1155 The ERC1155 deposit actions
  //  */
  // private aggregateERC1155Deposits(erc1155: Action[]) {
  //   // prettier-ignore
  //   const agg = erc1155.reduce<{ addresses: string[]; tokenIds: BigNumberish[]; amounts: BigNumberish[]; }>(
  //     (acc, { data }) => {
  //       const [address, tokenId, amount] = this._contract.interface.decodeFunctionResult(
  //         'depositERC1155',
  //         data,
  //       );
  //       acc.addresses.push(address);
  //       acc.tokenIds.push(tokenId);
  //       acc.amounts.push(amount);
  //       return acc;
  //     },
  //     { addresses: [], tokenIds: [], amounts: [] },
  //   );
  //   return this._contract.interface.encodeFunctionData('batchDepositERC1155', [
  //     agg.addresses,
  //     agg.tokenIds,
  //     agg.amounts,
  //   ]);
  // }

  // /**
  //  * Get the total value of all actions in the batch
  //  * @param actions The actions in the batch
  //  */
  // private totalValue(actions: Action[]) {
  //   return actions.reduce((acc, curr) => {
  //     const value = (curr as PayableAction).value;
  //     if (value) {
  //       return acc.add(value);
  //     }
  //     return acc;
  //   }, BigNumber.from(0));
  // }
}
