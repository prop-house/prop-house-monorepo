import { useContractCall } from '@usedapp/core';
import { BigNumber as EthersBN, utils } from 'ethers';
import { NounsDescriptorABI } from '@nouns/sdk';
import config from '../config';

const abi = new utils.Interface(NounsDescriptorABI);

export const useHeadCount = () => {
  const heads = useContractCall({
    abi,
    address: config.addresses.nounsDescriptor,
    method: 'headCount',
    args: [],
  });

  if (!heads) {
    return;
  }

  return EthersBN.from(heads[0]).toNumber();
};
