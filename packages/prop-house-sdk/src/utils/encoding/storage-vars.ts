import { pedersen } from 'micro-starknet';
import { hash } from 'starknet';
import { BN } from 'bn.js';

const MAX_STORAGE_ITEM_SIZE = BigInt(256);
const ADDR_BOUND = BigInt(2) ** BigInt(251) - MAX_STORAGE_ITEM_SIZE;

/**
 * Returns the storage address of a StarkNet storage variable given its name and arguments.
 * https://github.com/starkware-libs/cairo-lang/blob/d61255f32a7011e9014e1204471103c719cfd5cb/src/starkware/starknet/public/abi.py#L60-L70
 * @param varName storage_var name
 * @param args additional arguments
 */
export const getStorageVarAddress = (varName: string, ...args: string[]) => {
  let res = hash.starknetKeccak(varName);
  for (const arg of args) {
    res = BigInt(pedersen(res, arg));
  }
  return (res % ADDR_BOUND).toString();
};

export const offsetStorageVar = (address: string, offset: number) => {
  return new BN(address, 'be').add(new BN(offset)).toString();
};
