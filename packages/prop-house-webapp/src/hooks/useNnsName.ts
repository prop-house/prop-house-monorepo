import { Address } from 'viem';
import { useContractRead } from 'wagmi';

const nnsEnsReverseResolverAbi = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'resolve',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];

type FetchNnsNameArgs = {
  /** Address to lookup */
  address: Address;
};
type UseNnsNameArgs = Partial<FetchNnsNameArgs>;

const useNnsName = (args: UseNnsNameArgs) => {
  return useContractRead({
    abi: nnsEnsReverseResolverAbi,
    address: '0x849f92178950f6254db5d16d1ba265e70521ac1b',
    enabled: Boolean(args.address),
    functionName: 'resolve',
    select: d => d as string | null,
    args: [args.address],
  });
};

export default useNnsName;
