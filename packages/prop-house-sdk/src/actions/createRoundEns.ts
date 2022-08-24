import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { registerEnsSubdomain } from '../utils/registerEnsSubdomain';

export const createRoundEns = async (
  ens: string,
  subdomain: string,
  owner: string,
  providerOrSigner: Provider | Signer,
) => {
  try {
    return await registerEnsSubdomain(providerOrSigner, ens, subdomain, owner);
  } catch (e) {
    throw e;
  }
};
