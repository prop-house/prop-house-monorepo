import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { HouseMetadata } from '../types/HouseMetadata';
import { ipfsScheme, setEnsTextRecord, uploadToIpfs } from '../utils';
import { textRecordKeys } from '../constants';

/**
 * Sets IPFS as the value for the `prophouse` text record.
 *
 * Uploads metadata to IPFS and attempts to write said IPFS link to the corresponding text record value.
 */
export const createHouseMetadata = async (
  providerOrSigner: Provider | Signer,
  infuraProjectId: string,
  infuraSecret: string,
  ens: string,
  metadata: HouseMetadata
) => {
  let cid;
  try {
    cid = await uploadToIpfs(
      infuraProjectId,
      infuraSecret,
      JSON.stringify(metadata)
    );
  } catch (e) {
    throw e;
  }

  try {
    return setEnsTextRecord(
      providerOrSigner,
      ens,
      textRecordKeys.propHouse,
      ipfsScheme(cid)
    );
  } catch (e) {
    throw e;
  }
};
