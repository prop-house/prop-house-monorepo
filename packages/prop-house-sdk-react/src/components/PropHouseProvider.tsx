import {
  PropHouse,
  Custom,
  Starknet,
  Newable,
  StrategyHandlerBase,
  GovPowerStrategyConfig,
} from '@prophouse/sdk';
import React, { createContext, useEffect, useState } from 'react';
import { useProvider, useSigner } from 'wagmi';

export type PropHouseProps<CS extends Custom | void = void> = {
  children: React.ReactNode;
  starknet?: Starknet;
  customStrategies?: Newable<StrategyHandlerBase<GovPowerStrategyConfig<CS>>>[];
  customStarknetRelayer?: string;
};

export const PropHouseContext = createContext<PropHouse | undefined>(undefined);

export const PropHouseProvider = <CS extends Custom | void = void>({
  children,
  ...props
}: PropHouseProps<CS>) => {
  const provider = useProvider();
  const { data: signer } = useSigner();

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
