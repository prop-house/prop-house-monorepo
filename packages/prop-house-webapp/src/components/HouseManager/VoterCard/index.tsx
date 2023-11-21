import classes from './VoterCard.module.css';
import Text from '../Text';
import AddressAvatar from '../../AddressAvatar';
import { useEnsName } from 'wagmi';
import trimEthAddress from '../../../utils/trimEthAddress';
import { Asset, AssetType, VotingStrategyType } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import useAddressType from '../../../hooks/useAddressType';
import useAssetImages from '../../../hooks/useAssetImages';
import useAssetNames from '../../../hooks/useAssetNames';

const VoterCard: React.FC<{
  type: string;
  address: string;
  multiplier?: number;
  tokenId?: string;
}> = props => {
  const { type, address, multiplier, tokenId } = props;

  const { data: ens, isLoading } = useEnsName({ address: address as `0x${string}` });

  // TODO: Refactor hack that takes NewVoter and converts it to an Asset to use available hooks
  const contractType = useAddressType(address);
  const [wrapperAsset, setWrapperAsset] = useState<Asset>();
  const images = useAssetImages([wrapperAsset ?? ({} as Asset)]);
  const name = useAssetNames([wrapperAsset ?? ({} as Asset)]);

  useEffect(() => {
    if (!contractType || wrapperAsset) return;

    const { data: type } = contractType;

    const assetType =
      type === 'ERC721'
        ? AssetType.ERC721
        : type === 'ERC20'
        ? AssetType.ERC20
        : type === 'ERC1155'
        ? AssetType.ERC1155
        : undefined;
    if (!assetType) return;

    let _wrapperAsset = {
      assetType,
      address: address,
      tokenId: tokenId ? tokenId : '1',
      amount: '0',
    } as Asset;
    setWrapperAsset(_wrapperAsset);
  }, [contractType]);

  return (
    <div className={classes.container}>
      {type !== VotingStrategyType.ALLOWLIST ? (
        <div className={classes.imageContainer}>
          <img className={classes.image} src={images ? images[0] : ''} alt="avatar" />
        </div>
      ) : (
        <AddressAvatar address={address} size={42} />
      )}

      <div className={classes.text}>
        <Text type="subtitle">
          {!isLoading && type !== VotingStrategyType.ALLOWLIST
            ? name
              ? name
              : ''
            : ens
            ? ens
            : trimEthAddress(address)}
        </Text>

        <Text type="body">
          {`${multiplier} vote${multiplier === 1 ? '' : 's'}${
            type !== VotingStrategyType.ALLOWLIST ? ' / token' : ''
          }`}
        </Text>
      </div>
    </div>
  );
};

export default VoterCard;
