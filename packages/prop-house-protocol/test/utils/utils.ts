const getStarknetArtifactPath = (contract: string, ext: 'sierra' | 'casm') =>
  `./contracts/starknet/target/dev/prop_house_${contract}.${ext}.json`;
const getSierraPath = (contract: string) => getStarknetArtifactPath(contract, 'sierra');
const getCasmPath = (contract: string) => getStarknetArtifactPath(contract, 'casm');

export const getStarknetArtifactPaths = (contract: string) => ({
  sierra: getSierraPath(contract),
  casm: getCasmPath(contract),
});
