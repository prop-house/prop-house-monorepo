/**
 * This function takes an IPFS URI and returns a URL that can be used to fetch the image.
 * @param ipfsURI The IPFS hash
 * @returns formatted URL
 */
export const buildImageURL = (ipfsURI: string | undefined, gateway = 'cloudflare-ipfs.com'): string | undefined => {
  if (!ipfsURI) return;

  if (ipfsURI.startsWith('ipfs://')) {
    const ipfsHash = ipfsURI.substring(7);
    return `https://${gateway}/ipfs/${ipfsHash}`;
  }
  return ipfsURI.replace(/prophouse.mypinata.cloud/g, gateway);
};
