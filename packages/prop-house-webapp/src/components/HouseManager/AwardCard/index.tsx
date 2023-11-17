import classes from './AwardCard.module.css';
import Text from '../Text';
import Group from '../Group';
import AwardWithPlace from '../AwardWithPlace';
import TruncateThousands from '../../TruncateThousands';
import { EditableAsset } from '../AssetSelector';
import { AssetType } from '@prophouse/sdk-react';
import trimEthAddress from '../../../utils/trimEthAddress';
import { AssetWithMetadata, useAssetWithMetadata } from '../../../hooks/useAssetsWithMetadata';

const AwardCard: React.FC<{ award: EditableAsset; place: number }> = props => {
  const { award, place } = props;

  const [loading, assetWithMetadata] = useAssetWithMetadata(award);
  const asset = { ...assetWithMetadata, ...award } as EditableAsset & AssetWithMetadata;

  return (
    <div className={classes.container}>
      <AwardWithPlace place={place} />
      <hr className={classes.divider} />
      <Group gap={3} classNames={classes.text}>
        <Group row gap={4} classNames={classes.awardNameImg}>
          <div className={classes.imageContainer}>
            <img
              className={classes.image}
              src={asset.tokenImg ? asset.tokenImg : '/manager/fallback.png'}
              alt="avatar"
            />
          </div>

          <Text type="subtitle">{asset.symbol}</Text>
        </Group>

        <Text type="body">
          {award.assetType === AssetType.ERC721 || award.assetType === AssetType.ERC1155 ? (
            award.tokenId &&
            `#${award.tokenId.length > 5 ? trimEthAddress(award.tokenId) : award.tokenId}`
          ) : (
            <>
              <TruncateThousands amount={Number(award.amount)} decimals={1} /> {asset.symbol}
            </>
          )}
        </Text>
      </Group>
    </div>
  );
};

export default AwardCard;
