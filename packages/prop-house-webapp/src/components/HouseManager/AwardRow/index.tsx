import classes from './AwardRow.module.css';
import Group from '../Group';
import { AssetType } from '@prophouse/sdk-react';
import { EditableAsset } from '../AssetSelector';
import { formatCommaNum } from '../../../utils/formatCommaNum';
import trimEthAddress from '../../../utils/trimEthAddress';
import { AssetWithMetadata, useAssetWithMetadata } from '../../../hooks/useAssetsWithMetadata';

/**
 * @overview
 * After an IndividualAward has been selected, this component displays the award information.
 * It has the award image, name, amount, and USD value.
 */

const AwardRow: React.FC<{ award: EditableAsset }> = props => {
  const { award } = props;

  const [loading, assetWithMetadata] = useAssetWithMetadata(award);
  const asset = { ...assetWithMetadata, ...award } as EditableAsset & AssetWithMetadata;

  const isEth = asset.assetType === AssetType.ETH;
  const isErc20 = asset.assetType === AssetType.ERC20;
  const isErc1155 = asset.assetType === AssetType.ERC1155;
  const isErc721 = asset.assetType === AssetType.ERC721;

  return (
    <Group row gap={15} classNames={classes.row}>
      <div className={classes.addressSuccess}>
        <div className={classes.addressImgAndTitle}>
          <img src={asset.tokenImg ? asset.tokenImg : '/manager/fallback.png'} alt={asset.symbol} />

          <span>
            {(isEth || isErc20) &&
              `${formatCommaNum(Number(asset.amount), isEth ? 3 : 2)} ${asset.symbol}`}
            {(isErc1155 || isErc721) &&
              `${asset.symbol} #${
                asset.tokenId &&
                (asset.tokenId.length > 5 ? trimEthAddress(award.tokenId) : award.tokenId)
              }`}
          </span>
        </div>

        <div className={classes.votesText}>
          {(isErc1155 || isErc721) && trimEthAddress(award.address)}
        </div>
      </div>
    </Group>
  );
};

export default AwardRow;
