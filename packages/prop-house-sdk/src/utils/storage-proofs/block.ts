import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { JsonRpcProvider } from '@ethersproject/providers';
import { IntsSequence } from '../ints-sequence';
import { Block } from '@ethereumjs/block';
import { hexToBytes } from '../bytes';
import { encoding } from '../..';

export interface ProcessBlockInputs {
  blockNumber: number;
  headerInts: string[];
}

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
  hardfork = Hardfork.Cancun,
): Promise<ProcessBlockInputs> => {
  const providerURL = typeof provider === 'string' ? provider : provider.connection.url;
  const block = await Block.fromJsonRpcProvider(providerURL, BigInt(blockNumber), {
    common: new Common({ chain, hardfork })
  });
  const headerRlp = `0x${Buffer.from(block.header.serialize()).toString('hex')}`;
  const headerInts = IntsSequence.fromBytes(hexToBytes(headerRlp));

  return {
    blockNumber,
    headerInts: encoding.reverseByteOrder(headerInts.values),
  };
};
