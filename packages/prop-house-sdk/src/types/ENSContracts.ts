import { Contract } from 'ethers';

export interface ENSContracts {
  ensPublicResolver: Contract;
  ensRegistrarController: Contract;
  ensRegistry: Contract;
}
