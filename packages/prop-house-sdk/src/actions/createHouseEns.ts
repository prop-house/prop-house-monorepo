import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { registerEnsCommitment, registerEnsName } from '../utils';

// TODOS:
// createHouse should be able to handle all txs in one go (commit, register, set text records)
export const createHouseEns = async (
  ens: string,
  owner: string,
  providerOrSigner: Provider | Signer,
) => {
  try {
    // make commitment
    const { salt, tx } = await registerEnsCommitment(providerOrSigner, ens, owner);

    // wait for tx to be mined
    await tx.wait();

    // wait 60secs before registering
    setTimeout(async () => {
      const tx = await registerEnsName(providerOrSigner, ens, owner, 2419210, salt);
    }, 60000);
  } catch (e) {
    throw Error(`Error registering ENS: ${e}`);
  }
};
