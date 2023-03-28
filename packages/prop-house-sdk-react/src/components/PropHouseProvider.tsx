import { PropHouse, Custom, Starknet, Newable, StrategyHandlerBase, VotingStrategyConfig } from '@prophouse/sdk';
import React, { createContext, useEffect, useState } from 'react';
import { useNetwork, useProvider, useSigner } from 'wagmi';

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
  const { chain } = useNetwork();
  
  const [propHouse, setPropHouse] = useState<PropHouse<CS>>();

  useEffect(() => {
    if ((!provider && !signer) || !chain) return;

    setPropHouse(
      new PropHouse<CS>({
        ...props,
        evmChainId: chain.id,
        evm: signer || provider,
      })
    );
  }, [provider, signer, chain]);

  return (
    <PropHouseContext.Provider value={propHouse as PropHouse}>
      {children}
    </PropHouseContext.Provider>
  );
};
