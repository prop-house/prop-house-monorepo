import { JsonRpcProvider } from '@ethersproject/providers';
import { BALANCE_OF_FUNC, SINGLE_MAPPING_INDEX_TRACER } from '../../constants';
import { BigNumberish } from '@ethersproject/bignumber';
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
 * Return the slot index of the mapping that's read during the provided call.
 * Throw if no slots were read or if more than one slot was read.
 * @param provider The provider to use for the `debug_traceCall` call
 * @param contract The contract address
 * @param functionName The name of the function to call
 * @param functionParams The parameters to pass to the function
 */
export const getSlotIndexOfQueriedMapping = async (
  provider: JsonRpcProvider,
  contract: string,
  functionName: string,
  functionParams: BigNumberish[],
) => {
  const data = new Interface([BALANCE_OF_FUNC]).encodeFunctionData(functionName, functionParams);
  const result = await getEVMStorageSlotIndex(provider, contract, data, SINGLE_MAPPING_INDEX_TRACER);
  if (!result.readCount || result.slotIndex === '-1') {
    throw new Error(
      `No mappings read. Unexpected \`${functionName}\` implementation in contract ${contract}`,
    );
  }
  if (result.readCount > 1) {
    throw new Error(
      `More than one mapping read (${result.readCount}). Unexpected \`${functionName}\` implementation in contract ${contract}`,
    );
  }
  return {
    slotIndex: result.slotIndex,
  };
};
