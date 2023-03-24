import { PropHouse, PropHouseConfig, Custom } from '@prophouse/sdk';
import React, { createContext, useState } from 'react';

export type PropHouseProps<CS extends Custom | void = void> = {
  children: React.ReactNode;
  config: PropHouseConfig<CS>;
};

export const PropHouseContext = createContext<PropHouse | undefined>(undefined);

export const PropHouseProvider = ({ children, config }: PropHouseProps) => {
  const [propHouse] = useState(new PropHouse(config));

  return (
    <PropHouseContext.Provider value={propHouse}>
      {children}
    </PropHouseContext.Provider>
  );
};
