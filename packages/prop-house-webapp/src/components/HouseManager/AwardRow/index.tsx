import classes from './AwardRow.module.css';
import Group from '../Group';
import { AssetType } from '@prophouse/sdk-react';
import { Award } from '../AssetSelector';
import { formatCommaNum } from '../../../utils/formatCommaNum';
import trimEthAddress from '../../../utils/trimEthAddress';

/**
 * @overview
 * After an IndividualAward has been selected, this component displays the award information.
 * It has the award image, name, amount, and USD value.
 */

const AwardRow: React.FC<{ award: Award }> = props => {
  const { award } = props;

  const isEth = award.type === AssetType.ETH;
  const isErc20 = award.type === AssetType.ERC20;
  const isErc1155 = award.type === AssetType.ERC1155;
  const isErc721 = award.type === AssetType.ERC721;

  return (
    <Group row gap={15} classNames={classes.row}>
      <div className={classes.addressSuccess}>
        <div className={classes.addressImgAndTitle}>
          <img src={award.image ? award.image : '/manager/fallback.png'} alt={award.name} />

          <span>
            {(isEth || isErc20) &&
              `${formatCommaNum(award.amount, isEth ? 3 : 2)} ${award.symbol || award.name}`}
            {(isErc1155 || isErc721) &&
              `${award.name} #${
                award.tokenId &&
                (award.tokenId.length > 5 ? trimEthAddress(award.tokenId) : award.tokenId)
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
