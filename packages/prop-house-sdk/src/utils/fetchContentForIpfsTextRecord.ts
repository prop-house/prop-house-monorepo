import { Provider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import { ensContracts } from '../contracts';
import axios from 'axios';
import { trustedIpfsGatewayPath } from './trustedIpfsGatewayPath';

/**
 * Fetches the content of an ENS text record whose value is an IPFS path.
 */
export const fetchContentForIpfsTextRecord = async (
  ens: string,
  provider: Provider,
  textRecordKey: string,
) => {
  const ensNameHash = ethers.utils.namehash(ens);
  try {
    // fetch text record value
    const ipfsPath = await ensContracts(provider).ensPublicResolver.text(
      ensNameHash,
      textRecordKey,
    );

    // split ipfs path for cid
    const cid = ipfsPath.split('ipfs://')[1];
    return (await axios(trustedIpfsGatewayPath(cid))).data;
  } catch (e) {
    throw Error(`Error fetching content for ipfs text record: ${e}`);
  }
};
