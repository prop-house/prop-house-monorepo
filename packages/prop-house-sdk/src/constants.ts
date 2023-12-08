import { AssetType } from './types';

/**
 * Non-zero address used for balance slot detection
 */
export const ADDRESS_ONE = '0x0000000000000000000000000000000000000001';

/**
 * The `balanceOf` function signature.
 */
// prettier-ignore
export const BALANCE_OF_FUNC = 'function balanceOf(address account) external view returns (uint256)';

/**
 * The `balanceOf` function signature for ERC1155 tokens.
 */
// prettier-ignore
export const BALANCE_OF_ERC1155_FUNC = 'function balanceOf(address account, uint256 id) external view returns (uint256)';

/**
 * The address used to query `balanceOf` functions to detect the slot index.
 */
export const BALANCE_OF_SLOT_QUERY_ADDRESS = '0x123456789abcdef123456789abcdef123456789a';

/**
 * A JavaScript tracer that's used to detect the slot index of an ERC721, ERC20, or ERC1155 balance mapping.
 * This tracer returns the slot index as well as the number of mapping reads.
 * @param assetType The type of asset to create the tracer for.
 */
const createBalanceOfSlotTracer = (assetType: AssetType) => `{
  count: 0,
  memoryValues: [],
  mappingReadInProgress: false,
  fault: function(log) {},
  step: function(log) {
    if (log.op.toString() === 'MSTORE') this.memoryValues.push(log.stack.peek(1).toString());

    // We consider a KECCAK operation as being the start of a mapping read.
    if(['SHA3', 'KECCAK256'].includes(log.op.toString())){
      this.mappingReadInProgress = true;
    }

    // We consider an SLOAD as the end of a mapping read, if one is in progress.
    if (this.mappingReadInProgress && log.op.toString() === 'SLOAD') {
      this.count += 1;
      this.mappingReadInProgress = false;
    }
  },
  result: function() {
    const queriedAddressIndex = this.memoryValues.findIndex(memVal => memVal === '${BigInt(BALANCE_OF_SLOT_QUERY_ADDRESS).toString()}');
    if (!~queriedAddressIndex) throw new Error('Could not find the queried address in memory');

    // The slot index is the value in memory after the queried address.
    const slotIndex = this.memoryValues[queriedAddressIndex ${assetType === AssetType.ERC1155 ? '-' : '+'} 1];
    if (slotIndex === undefined) throw new Error('Slot index is undefined');

    return {
      slotIndex: slotIndex,
      readCount: this.count,
    };
  }
}`;

/**
 * A JavaScript tracer that's used to detect the slot index of an ERC721/ERC20 balance mapping.
 */
export const BALANCE_OF_SLOT_TRACER = createBalanceOfSlotTracer(AssetType.ERC721);

/**
 * A JavaScript tracer that's used to detect the slot index of an ERC1155 balance mapping.
 */
export const BALANCE_OF_ERC1155_SLOT_TRACER = createBalanceOfSlotTracer(AssetType.ERC1155);

/**
 * The Pinata JWT with limited permissions.
 */
export const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhNGE4Y2ZjNC0yMDAzLTQ5MjQtYTQ3Ny1hYjRlY2EyMzdlMTYiLCJlbWFpbCI6InBocGluYXRhQGRldmNhcnJvdC53dGYiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6IkZSQTEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX0seyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNjIyZDJiM2Y5MzkyM2VjNWJiYzkiLCJzY29wZWRLZXlTZWNyZXQiOiI0NDJkMmU3YTBhNDQ3M2IzNDE2MjA4YTgwZjc4YWE5NDlhOGExZmFiNDliZDYzOGMxYjc1ZDJhMDY0MWEyYWMyIiwiaWF0IjoxNzAxODE4NTg2fQ.RHlvRAdgbG0Dlg-laK7QMR_ZHAMGCNFMM1RTlwy1RAk';
