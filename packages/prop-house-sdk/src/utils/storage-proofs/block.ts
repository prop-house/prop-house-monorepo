import { Chain, Common, Hardfork } from 'ethereumjs-fork-common';
import { blockFromRpc } from 'ethereumjs-fork-block/dist/from-rpc';
import { Block, JsonRpcBlock } from 'ethereumjs-fork-block';
import { JsonRpcProvider } from '@ethersproject/providers';
import { BigNumber } from '@ethersproject/bignumber';
import { IntsSequence } from '../ints-sequence';
import { hexToBytes } from '../bytes';

export interface ProcessBlockInputs {
  blockNumber: number;
  blockOptions: number;
  headerInts: IntsSequence;
}

/**
 * Produces the input data for the process_block function in Herodotus
 * using a JSON RPC block
 * @param block Block object from RPC call
 * @param chain EVM chain identifier
 * @param hardfork Hardfork identifier
 */
export const getProcessBlockInputsForRpcBlock = async (
  block: JsonRpcBlock,
  chain = Chain.Mainnet,
  hardfork = Hardfork.Shanghai,
): Promise<ProcessBlockInputs> => {
  const header = blockFromRpc(block, [], { common: new Common({ chain, hardfork }) });
  const headerRlp = `0x${header.serialize().toString('hex')}`;
  const headerInts = IntsSequence.fromBytes(hexToBytes(headerRlp));
  return {
    blockNumber: BigNumber.from(block.number).toNumber(),
    blockOptions: 8,
    headerInts: headerInts as IntsSequence,
  };
};

/**
 * Produces the input data for the process_block function in Herodotus
 * using a block number.
 * @param block Block object from RPC call
 * @param chain EVM chain identifier
 * @param hardfork Hardfork identifier
 */
export const getProcessBlockInputsForBlockNumber = async (
  provider: JsonRpcProvider | string,
  blockNumber: number,
  chain = Chain.Mainnet,
  hardfork = Hardfork.Shanghai,
): Promise<ProcessBlockInputs> => {
  const block = await Block.fromEthersProvider(provider, BigInt(blockNumber), {
    common: new Common({ chain, hardfork }),
  });
  const headerRlp = `0x${block.header.serialize().toString('hex')}`;
  const headerInts = IntsSequence.fromBytes(hexToBytes(headerRlp));

  return {
    blockNumber,
    blockOptions: 8,
    headerInts: headerInts as IntsSequence,
  };
};
