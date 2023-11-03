import { RoundAward } from '@prophouse/sdk-react';
import { erc721ABI } from '@wagmi/core';
import { useEffect, useState } from 'react';
import { useContractReads } from 'wagmi';
import { resolveUri } from '../utils/resolveUri';
import { erc1155ABI } from '../abi/ERC1155ABI';

const erc20img = (tokenAddress: string) => {
  switch (tokenAddress) {
    case '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48':
    case '0xa375a26dbb09f5c57fb54264f393ad6952d1d2de':
      return '/manager/usdc.svg';
    case '0xdac17f958d2ee523a2206206994597c13d831ec7':
      return '/manager/usdt.svg';
    default:
      return '/manager/token.svg';
  }
};

/**
 * Fetches symbols, decimals and token imgs for each award and returns a FullRoundAward
 */
const useAwardImages = (awards: RoundAward[]): string[] | undefined => {
  const [awardImages, setAwardImages] = useState<string[] | undefined>();

  const [erc721imgUris, setErc721imgUris] = useState<{ [key: string]: string } | undefined>();
  const erc721Awards = awards.filter(award => award.asset.assetType === 'ERC721');
  const hasErc721s = erc721Awards.length > 0;

  const [erc1155imgUris, setErc1155imgUris] = useState<{ [key: string]: string } | undefined>();
  const erc1155Awards = awards.filter(award => award.asset.assetType === 'ERC1155');
  const hasErc1155s = erc1155Awards.length > 0;

  // fetch erc1155 tokenURIs
  const { data: erc1155TokenUriFetch, isLoading: loadingErc1155TokenUris } = useContractReads({
    contracts: awards
      .filter(a => a.asset.assetType === 'ERC1155')
      .map(award => {
        return {
          address: award.asset.token as `0x${string}`,
          abi: erc1155ABI,
          functionName: 'uri',
          args: [award.asset.identifier],
        };
      }),
  });

  // fetch erc721 tokenURIs
  const { data: erc721TokenUriFetch, isLoading: loadingErc721TokenUri } = useContractReads({
    contracts: awards
      .filter(a => a.asset.assetType === 'ERC721')
      .map(award => {
        return {
          address: award.asset.token as `0x${string}`,
          abi: erc721ABI,
          functionName: 'tokenURI',
          args: ['169'],
        };
      }),
  });

  // parse erc1155 tokenURIs into image URIs
  useEffect(() => {
    if (!hasErc1155s || !erc1155TokenUriFetch || erc1155imgUris || loadingErc1155TokenUris) return;

    const resolveImageUris = async () => {
      let mapped: { [key: string]: string } = {};
      // decode base64 tokenURIs
      const imageUrisPromises = erc1155TokenUriFetch.map(uri => {
        if (!uri.result) return null;
        return resolveUri(uri.result as string);
      });
      const imageUris = await Promise.all(imageUrisPromises);

      //   map them to their corresponding token address + identifier
      erc1155Awards.forEach((erc1155Award, index) => {
        mapped[`${erc1155Award.asset.token}-${erc1155Award.asset.identifier}`] = imageUris[index];
      });

      setErc1155imgUris(mapped);
    };
    resolveImageUris();
  }, [erc1155TokenUriFetch, hasErc1155s, erc1155Awards, loadingErc1155TokenUris, erc1155imgUris]);

  // parse erc721 tokenURIs into image URIs
  useEffect(() => {
    if (!hasErc721s || !erc721TokenUriFetch || erc721imgUris || loadingErc721TokenUri) return;

    const resolveImageUris = async () => {
      let mapped: { [key: string]: string } = {};
      // decode base64 tokenURIs
      const imageUrisPromises = erc721TokenUriFetch.map(uri => {
        if (!uri.result) return null;
        return resolveUri(uri.result as string);
      });
      const imageUris = await Promise.all(imageUrisPromises);

      // map them to their corresponding token address + identifier
      erc721Awards.forEach((erc721Award, index) => {
        mapped[`${erc721Award.asset.token}-${erc721Award.asset.identifier}`] = imageUris[index];
      });
      setErc721imgUris(mapped);
    };
    resolveImageUris();
  }, [erc721TokenUriFetch, hasErc721s, erc721Awards, loadingErc721TokenUri, erc721imgUris]);

  useEffect(() => {
    if (awardImages || (hasErc721s && !erc721imgUris) || (hasErc1155s && !erc1155imgUris)) return;

    const mappedAwards = awards.map((award, index) => {
      switch (award.asset.assetType) {
        case 'NATIVE':
          return '/manager/eth.png';
        case 'ERC721':
          const uri721 =
            erc721imgUris && erc721imgUris[`${award.asset.token}-${award.asset.identifier}`];
          return uri721 ? uri721 : '/manager/nft.svg';
        case 'ERC20':
          return erc20img(award.asset.token);
        case 'ERC1155':
          const eri1155 =
            erc1155imgUris && erc1155imgUris[`${award.asset.token}-${award.asset.identifier}`];
          return eri1155 ? eri1155 : '/manager/token.svg';
        default:
          return '/manager/fallback.png';
      }
    });
    setAwardImages(mappedAwards);
  }, [awards, erc721imgUris, erc1155imgUris, hasErc721s, hasErc1155s, awardImages]);

  return awardImages;
};

export default useAwardImages;
