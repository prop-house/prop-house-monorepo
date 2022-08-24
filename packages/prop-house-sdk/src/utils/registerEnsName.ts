import { Provider } from '@ethersproject/providers';
import { ensContracts } from '../contracts';
import { BigNumber, ContractTransaction, Signer } from 'ethers';

/**
 * Register ENS name.
 *
 * Must wait 60 seconds after making commitment tx prior to attempting to register.
 * Must also use `salt` used as param in commitment tx.
 */
export const registerEnsName = async (
  providerOrSigner: Provider | Signer,
  name: string,
  owner: string,
  duration: number,
  salt: string,
) => {
  const controller = ensContracts(providerOrSigner).ensRegistrarController;

  // Add 10% to account for price fluctuation; the difference is refunded.
  const price = (await controller.rentPrice(name, duration)) * 1.1;

  // Submit our registration request (must wait 60 seconds post commitment tx being mined)
  try {
    return (await controller.register(name, owner, BigNumber.from(duration), salt, {
      value: Math.trunc(price),
    })) as ContractTransaction;
  } catch (e) {
    throw `Error registering ENS domain: ${e}`;
  }
};
