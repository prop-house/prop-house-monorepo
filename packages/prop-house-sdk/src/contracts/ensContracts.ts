import { ENSContracts } from '../types';
import { ethers, Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ensContractAddresses } from './addresses';

import ENSRegistrarControllerABI from './ABIs/ENSRegistrarControllerABI.json';
import ENSPublicResolverABI from './ABIs/ENSPublicResolverABI.json';
import ENSRegistryABI from './ABIs/ENSRegistryABI.json';

export const ensContracts = (signerOrProvider: Signer | Provider): ENSContracts => {
  return {
    ensPublicResolver: new ethers.Contract(
      ensContractAddresses.ensPublicResolver,
      ENSPublicResolverABI,
      signerOrProvider,
    ),
    ensRegistrarController: new ethers.Contract(
      ensContractAddresses.ensRegistrarController,
      ENSRegistrarControllerABI,
      signerOrProvider,
    ),
    ensRegistry: new ethers.Contract(
      ensContractAddresses.ensRegistry,
      ENSRegistryABI,
      signerOrProvider,
    ),
  };
};
