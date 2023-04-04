import { useContractRead } from 'wagmi';

const abi = [
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];
const functionName = 'decimals';

export default function useGetDecimals(erc20Address: string) {
  const { data, isLoading, isError } = useContractRead({
    address: erc20Address,
    abi,
    functionName,
  });

  return { data, isLoading, isError };
}
