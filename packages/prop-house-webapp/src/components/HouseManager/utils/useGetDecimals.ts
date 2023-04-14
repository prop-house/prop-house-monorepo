import { useContractRead } from 'wagmi';

// Get decimals number from contract

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

// TODO: Getting a lot of `undefined` decimals, but i think it's because we're on Goerli
// TODO: Need to test on mainnet
export default function useGetDecimals(erc20Address: string) {
  const { data, isLoading, isError } = useContractRead({
    address: erc20Address,
    abi,
    functionName,
  });

  return { data, isLoading, isError };
}
