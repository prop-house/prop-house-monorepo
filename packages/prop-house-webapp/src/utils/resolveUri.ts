const generateIpfsUri = (ipfsHash: string) => `https://ipfs.io/ipfs/${ipfsHash}`;

export const resolveUri = async (uriData: string) => {
  if (uriData.startsWith('ipfs://')) {
    const ipfsHash = uriData.split('ipfs://')[1];
    const ipfsUri = generateIpfsUri(ipfsHash);
    const result = await fetch(ipfsUri);
    const json = await result.json();

    if (json.image.startsWith('ipfs://')) return generateIpfsUri(json.image.split('ipfs://')[1]);

    return json.image;
  }

  if (uriData.startsWith('data:')) {
    const decodedUri = Buffer.from(uriData.split('base64,')[1], 'base64').toString('utf-8');
    return JSON.parse(decodedUri).image;
  }

  return uriData;
};
