/**
 * This function takes an IPFS URI and returns a URL that can be used to fetch the image.
 * @param ipfsURI The IPFS hash
 * @returns formatted URL
 */
export const buildImageURL = (ipfsURI: string, gateway: string = 'https://ipfs.io'): string => {
  if (ipfsURI.startsWith('ipfs://')) {
    const ipfsHash = ipfsURI.substring(7);
    return `${gateway}/ipfs/${ipfsHash}`;
  } else {
    return ipfsURI;
  }
};
