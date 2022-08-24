import { Signer, ContractTransaction, ethers } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ensContracts } from '../contracts';

export const setEnsTextRecord = async (
  providerOrSigner: Provider | Signer,
  ens: string,
  key: string,
  value: string,
) => {
  const ensNameHash = ethers.utils.namehash(ens);

  try {
    return (await ensContracts(providerOrSigner).ensPublicResolver.setText(
      ensNameHash,
      key,
      value,
    )) as ContractTransaction;
  } catch (e) {
    throw Error(`Error writting ENS text record: ${e}`);
  }
};
