import { ensContracts } from '../contracts';
import { ContractTransaction, ethers, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';

/**
 * Make commitment to register ENS name.
 * @returns
 * corresponding `tx` and `salt` which is required to register the ENS domain the commitment was made with.
 */
export const registerEnsCommitment = async (
  providerOrSigner: Provider | Signer,
  name: string,
  owner: string
) => {
  const controller = ensContracts(providerOrSigner).ensRegistrarController;

  // Generate a random value to mask our commitment
  const random = ethers.utils.randomBytes(32);
  const salt =
    '0x' +
    Array.from(random)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

  try {
    // Submit our commitment to the smart contract
    const commitment = await controller.makeCommitment(name, owner, salt);
    const tx: ContractTransaction = await controller.commit(commitment);

    return { salt, tx };
  } catch (e) {
    throw `Error making commitment to register ENS domain: ${e}`;
  }
};
