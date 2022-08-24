import { Signer } from 'ethers';
import { Provider } from '@ethersproject/providers';
import { ipfsScheme, setEnsTextRecord, timeperiodValidation, uploadToIpfs } from '../utils';
import { textRecordKeys } from '../constants';
import { PropHouseRoundMetadata, SnapshotRoundMetadata } from '../types';
import { parseStrategy } from '../utils/parseStategy';

export const createRound = async (
  providerOrSigner: Provider | Signer,
  infuraProjectId: string,
  infuraSecret: string,
  ens: string,
  metadata: PropHouseRoundMetadata,
) => {
  // check ens
  if (!ens) throw Error('Error: invalid ens.');
  // check metadata provided
  // todo: skip optionals
  Object.entries(metadata).forEach(([key, value]) => {
    // if (!value) throw Error(`Error: ${key} does not have a value.`);
  });

  let validStrategy;
  try {
    validStrategy = parseStrategy(
      metadata.strategy,
      metadata.contractAddress,
      metadata.customStrategy,
    );
  } catch (e) {
    throw e;
  }

  const snapshotMetadata: SnapshotRoundMetadata = {
    name: metadata.name,
    about: metadata.about,
    admins: metadata.adminAddress ? [metadata.adminAddress] : [],
    network: '1',
    strategies: [validStrategy],
    validation: timeperiodValidation(metadata.proposingStart, metadata.votingStart),
  };

  let propHouseCid;
  let snapshotCid;
  try {
    // propHouseCid = await uploadToIpfs(infuraProjectId, infuraSecret, JSON.stringify(metadata));
    snapshotCid = await uploadToIpfs(
      infuraProjectId,
      infuraSecret,
      JSON.stringify(snapshotMetadata),
    );
    console.log(snapshotCid);
  } catch (e) {
    throw e;
  }

  try {
    // call multicall to set both text records at once
    const tx = await setEnsTextRecord(
      providerOrSigner,
      ens,
      textRecordKeys.snapshot,
      ipfsScheme(snapshotCid),
    );
    // await setEnsTextRecord(
    //   providerOrSigner,
    //   ens,
    //   textRecordKeys.snapshot,
    //   ipfsScheme(propHouseCid),
    // );
    return tx;
  } catch (e) {
    throw e;
  }
};
