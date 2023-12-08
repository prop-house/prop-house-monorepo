import 'wagmi';

declare module 'wagmi' {
  declare function useProvider(): JsonRpcProvider;
  declare function useSigner(): { data: Signer | null };
}
