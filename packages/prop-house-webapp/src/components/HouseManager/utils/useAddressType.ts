import { useContractRead } from 'wagmi';

const contractAddress = '0x905429be6e2e07b6a7df6b2acd7806090a8e8915';
const abi = [
  {
    inputs: [{ internalType: 'address', name: 'addr', type: 'address' }],
    name: 'getType',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
];
const functionName = 'getType';

export default function useAddressType(address: string) {
  const { data, isLoading, isError } = useContractRead({
    address: contractAddress,
    abi,
    functionName,
    args: [address as `0x${string}`],
  });

  return { data, isLoading, isError };
}
