export const buildImageURL = (ipfsURI: string, gateway: string = 'https://ipfs.io'): string => {
  if (ipfsURI.startsWith('ipfs://')) {
    const ipfsHash = ipfsURI.substring(7);
    return `${gateway}/ipfs/${ipfsHash}`;
  } else {
    return ipfsURI;
  }
};
