import { hash } from 'starknet';

/**
 * Computes the Pedersen hash of a execution payload for StarkNet
 * This can be used to produce the input for calling the commit method in the StarkNet Commit contract.
 * @param target The target address of the execution
 * @param selector The selector for the method at address target one wants to execute
 * @param calldata The payload for the method at address target one wants to execute
 */
export const getCommit = (target: string, selector: string, calldata: string[]): string => {
  return hash.computeHashOnElements([target, selector, ...calldata]);
};
