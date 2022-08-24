import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ipfsScheme, setEnsTextRecord, uploadToIpfs } from '../utils';
import { textRecordKeys } from '../constants';
import { RoundMetadata } from '../types';

export const createRound = async (
  providerOrSigner: Provider | Signer,
  infuraProjectId: string,
  infuraSecret: string,
  ens: string,
  metadata: RoundMetadata,
) => {
  let cid;

  try {
    cid = await uploadToIpfs(infuraProjectId, infuraSecret, JSON.stringify(metadata));
  } catch (e) {
    throw e;
  }

  try {
    return setEnsTextRecord(providerOrSigner, ens, textRecordKeys.snapshot, ipfsScheme(cid));
  } catch (e) {
    throw e;
  }
};
