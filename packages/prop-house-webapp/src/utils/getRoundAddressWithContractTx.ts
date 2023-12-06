import { PropHouse__factory } from '@prophouse/sdk-react';
import { ContractTransaction } from 'ethers';

const PROP_HOUSE_IFACE = PropHouse__factory.createInterface();

export const getRoundAddressWithContractTx = async (
  response: ContractTransaction,
): Promise<string | undefined> => {
  const result = await response.wait();
  const roundCreationLog = result.events?.find(event => {
    try {
      const log = PROP_HOUSE_IFACE.parseLog(event);
      if (log.name === 'RoundCreated') {
        return log;
      }
    } catch {}
  });
  return roundCreationLog?.args?.round;
};
