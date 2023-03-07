import { JsonRpcProvider } from '@ethersproject/providers';
import { ADDRESS_ONE, BALANCE_OF_TRACER } from '../../constants';
import { Interface } from '@ethersproject/abi';

export interface SlotInfo {
  slotIndex: string;
  readCount: number;
}

/**
 * Given a contract address, data, and tracer, return the slot information that's read during the call.
 * @param provider The provider to use for the `debug_traceCall` call
 * @param contract The contract address
 * @param data The calldata
 * @param tracer The custom tracer
 */
const getEVMStorageSlotIndex = async (
  provider: JsonRpcProvider,
  contract: string,
  data: string,
  tracer: string,
): Promise<SlotInfo> => {
  return provider.send('debug_traceCall', [
    {
      to: contract,
      data,
      maxFeePerGas: '0xFFFFFFFFFFF',
    },
    'latest',
    {
      tracer,
    },
  ]);
};

/**
 * Return the slot index of the mapping that contains the balance information read during
 * a `balanceOf` call. Throw if no slots were read or if more than one slot was read.
 * @param provider The provider to use for the `debug_traceCall` call
 * @param contract The contract address
 */
export const getBalanceOfEVMStorageSlotIndex = async (
  provider: JsonRpcProvider,
  contract: string,
) => {
  const data = new Interface([
    'function balanceOf(address account)',
  ]).encodeFunctionData('balanceOf', [ADDRESS_ONE]);
  const result = await getEVMStorageSlotIndex(provider, contract, data, BALANCE_OF_TRACER);
  if (!result.readCount || result.slotIndex === '-1') {
    throw new Error(
      `No mappings read. Unusual \`balanceOf\` implementation in contract ${contract}`,
    );
  }
  if (result.readCount > 1) {
    throw new Error(
      `More than one mapping read (${result.readCount}). Unusual \`balanceOf\` implementation in contract ${contract}`,
    );
  }
  return {
    slotIndex: result.slotIndex,
  };
};
