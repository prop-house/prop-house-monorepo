export const ReclaimABI = [
  {
    inputs: [
      {
        components: [
          { internalType: 'enum AssetType', name: 'assetType', type: 'uint8' },
          { internalType: 'address', name: 'token', type: 'address' },
          { internalType: 'uint256', name: 'identifier', type: 'uint256' },
          { internalType: 'uint256', name: 'amount', type: 'uint256' },
        ],
        internalType: 'struct Asset[]',
        name: 'assets',
        type: 'tuple[]',
      },
    ],
    name: 'reclaim',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
];
