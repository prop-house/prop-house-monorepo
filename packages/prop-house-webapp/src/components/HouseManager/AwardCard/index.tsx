import classes from './AwardCard.module.css';
import Text from '../Text';
import Group from '../Group';
import AwardWithPlace from '../AwardWithPlace';
import TruncateThousands from '../../TruncateThousands';
import { Award } from '../AssetSelector';
import { AssetType } from '@prophouse/sdk-react';

const AwardCard: React.FC<{ award: Award; place: number }> = props => {
  const { award, place } = props;

  return (
    <div className={classes.container}>
      <AwardWithPlace place={place} />

      <hr className={classes.divider} />

      <Group gap={3} classNames={classes.text}>
        <Group row gap={4} classNames={classes.awardNameImg}>
          <div className={classes.imageContainer}>
            <img
              className={classes.image}
              src={award.image ? award.image : '/manager/fallback.png'}
              alt="avatar"
            />
          </div>

          <Text type="subtitle">{award.name}</Text>
        </Group>

        <Text type="body">
          {award.type === AssetType.ERC721 || award.type === AssetType.ERC1155 ? (
            `#${award.tokenId}`
          ) : (
            <>
              <TruncateThousands amount={award.amount} decimals={1} />{' '}
              {award.type === AssetType.ETH ? award.name : award.symbol || award.name}
            </>
          )}
        </Text>
      </Group>
    </div>
  );
};

export default AwardCard;
