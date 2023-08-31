import { buildPhIpfsUrl } from './ipfs';

const buildIpfsPath = (ipfsHash: string) =>
  buildPhIpfsUrl({ cid: ipfsHash, fullIpfsPath: ipfsHash });

export default buildIpfsPath;
