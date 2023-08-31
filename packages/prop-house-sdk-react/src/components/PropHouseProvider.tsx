import {
  PropHouse,
  Custom,
  Starknet,
  Newable,
  StrategyHandlerBase,
  VotingStrategyConfig,
} from '@prophouse/sdk';
import React, { createContext, useEffect, useState } from 'react';
import { FallbackProvider, JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import {
  usePublicClient,
  useProvider,
  useWalletClient,
  useSigner,
  PublicClient,
  WalletClient,
} from 'wagmi';
import { type HttpTransport } from 'viem';

const publicClientToProvider = (publicClient: PublicClient) => {
  const { chain, transport } = publicClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  if (transport.type === 'fallback')
    return new FallbackProvider(
      (transport.transports as ReturnType<HttpTransport>[]).map(
        ({ value }) => new JsonRpcProvider(value?.url, network),
      ),
    );
  return new JsonRpcProvider(transport.url, network);
};

const walletClientToSigner = (walletClient: WalletClient) => {
  const { account, chain, transport } = walletClient;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return signer;
};

const useEthersProvider = ({ chainId }: { chainId?: number } = {}) => {
  const publicClient = usePublicClient({ chainId });
  return React.useMemo(() => publicClientToProvider(publicClient), [publicClient]);
};

const useEthersSigner = ({ chainId }: { chainId?: number } = {}) => {
  const { data: walletClient } = useWalletClient({ chainId });
  return {
    data: React.useMemo(
      () => (walletClient ? walletClientToSigner(walletClient) : undefined),
      [walletClient],
    ),
  };
};

export type PropHouseProps<CS extends Custom | void = void> = {
  children: React.ReactNode;
  starknet?: Starknet;
  customStrategies?: Newable<StrategyHandlerBase<VotingStrategyConfig<CS>>>[];
  customStarknetRelayer?: string;
};

export const PropHouseContext = createContext<PropHouse | undefined>(undefined);

export const PropHouseProvider = <CS extends Custom | void = void>({
  children,
  ...props
}: PropHouseProps<CS>) => {
  const provider = useProvider?.() || useEthersProvider();
  const { data: signer } = useSigner?.() || useEthersSigner();

  const [propHouse, setPropHouse] = useState(
    new PropHouse({
      ...props,
      evmChainId: provider.network.chainId,
      evm: signer || provider,
    }),
  );

  useEffect(() => {
    if (!provider && !signer) return;

    setPropHouse(propHouse.attach(signer || provider));
  }, [provider, signer]);

  return (
    <PropHouseContext.Provider value={propHouse as PropHouse}>{children}</PropHouseContext.Provider>
  );
};
