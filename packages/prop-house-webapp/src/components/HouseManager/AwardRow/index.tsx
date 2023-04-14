import classes from './AwardRow.module.css';
import Group from '../Group';
import { AssetType } from '@prophouse/sdk-react';
import { Award } from '../AssetSelector';
import { formatCommaNum } from '../utils/formatCommaNum';
import trimEthAddress from '../../../utils/trimEthAddress';

/**
 * @overview
 * After an IndividualAward has been selected, this component displays the award information.
 * It has the award image, name, amount, and USD value.
 */

const AwardRow: React.FC<{ award: Award }> = props => {
  const { award } = props;

  return (
    <Group row gap={15} classNames={classes.row}>
      <div className={classes.addressSuccess}>
        <div className={classes.addressImgAndTitle}>
          <img src={award.image} alt={award.name} />

          <span>
            {(award.type === AssetType.ETH || award.type === AssetType.ERC20) &&
              `${formatCommaNum(award.amount)} ${award.symbol || award.name}`}
            {(award.type === AssetType.ERC1155 || award.type === AssetType.ERC721) &&
              `${award.name} #${award.tokenId}`}
          </span>
        </div>

        <div className={classes.votesText}>
          {(award.type === AssetType.ETH || award.type === AssetType.ERC20) &&
            `$${formatCommaNum(award.price * award.amount)}`}
          {(award.type === AssetType.ERC1155 || award.type === AssetType.ERC721) &&
            trimEthAddress(award.address)}
        </div>
      </div>
    </Group>
  );
};

export default AwardRow;
