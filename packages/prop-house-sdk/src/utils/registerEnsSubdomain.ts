import { Provider } from '@ethersproject/providers';
import { ensContracts } from '../contracts';
import { ethers, ContractTransaction, Signer } from 'ethers';

export const registerEnsSubdomain = async (
  providerOrSigner: Provider | Signer,
  ensDomain: string,
  subdomain: string,
  owner: string,
) => {
  const registry = ensContracts(providerOrSigner).ensRegistry;
  const ensNameHash = ethers.utils.namehash(ensDomain);
  const subdomainHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(subdomain));

  try {
    return (await registry.setSubnodeOwner(
      ensNameHash,
      subdomainHash,
      owner,
    )) as ContractTransaction;
  } catch (e) {
    throw `Error registering ENS subdomain: ${e}`;
  }
};
