import { buildNftStorageUrl } from './ipfs';

const buildIpfsPath = (ipfsHash: string) =>
  buildNftStorageUrl({ cid: ipfsHash, fullIpfsPath: ipfsHash });

export default buildIpfsPath;
