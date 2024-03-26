import { Provider } from '@ethersproject/abstract-provider';

export const signerIsContract = async (
  provider: Provider,
  account: `0x${string}` | undefined,
) => {
  if (!provider || !account) return false;

  const code = await provider.getCode(account);
  const isContract = code !== '0x';
  return isContract;
};
