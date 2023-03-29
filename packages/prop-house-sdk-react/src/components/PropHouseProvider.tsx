import { PropHouse, Custom, Starknet, Newable, StrategyHandlerBase, VotingStrategyConfig } from '@prophouse/sdk';
import React, { createContext, useEffect, useState } from 'react';
import { useProvider, useSigner } from 'wagmi';

export type PropHouseProps<CS extends Custom | void = void> = {
  children: React.ReactNode;
  starknet?: Starknet;
  customStrategies?: Newable<StrategyHandlerBase<VotingStrategyConfig<CS>>>[];
  customStarknetRelayer?: string;
};

export const PropHouseContext = createContext<PropHouse | undefined>(undefined);

export const PropHouseProvider = <CS extends Custom | void = void>({ children, ...props }: PropHouseProps<CS>) => {
  const provider = useProvider();
  const { data: signer } = useSigner();
  
  const [propHouse, setPropHouse] = useState<PropHouse<CS>>();

  useEffect(() => {
    if (!provider && !signer) return;

    // Prop house instantiation will throw if the user is on an unsupported network
    try {
      setPropHouse(
        propHouse?.attach(signer || provider) ?? new PropHouse<CS>({
          ...props,
          evmChainId: provider.network.chainId,
          evm: signer || provider,
        })
      );
    } catch (error: unknown) {
      console.warn(`Failed to populate \`PropHouseProvider\` with error: ${error}`);
    }
  }, [provider, signer]);

  return (
    <PropHouseContext.Provider value={propHouse as PropHouse}>
      {children}
    </PropHouseContext.Provider>
  );
};
