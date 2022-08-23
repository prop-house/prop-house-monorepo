import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';

/**
 * Pins content to IPFS and returns CID of result.
 */
export const uploadToIpfs = async (
  infuraProjectId: string,
  infuraSecret: string,
  content: string
): Promise<string> => {
  const auth =
    'Basic ' +
    Buffer.from(infuraProjectId + ':' + infuraSecret).toString('base64');

  const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });

  try {
    const result = await client.add(content);
    return result.cid.toString();
  } catch (e) {
    throw Error(`Error pinning ipfs content: ${e}`);
  }
};
