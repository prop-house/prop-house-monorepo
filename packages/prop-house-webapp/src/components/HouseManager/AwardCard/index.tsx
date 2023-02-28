import classes from './AwardCard.module.css';
import Text from '../Text';
import { AwardProps } from '../AwardsSelector';
import Group from '../Group';
import AwardWithPlace from '../AwardWithPlace';
import TruncateThousands from '../../TruncateThousands';

const AwardCard: React.FC<{
  amount: number;
  award: AwardProps;
  place: number;
}> = props => {
  const { amount, award, place } = props;

  return (
    <div className={classes.container}>
      <AwardWithPlace place={place} />

      <hr className={classes.divider} />

      <Group gap={3} classNames={classes.text}>
        <Group row gap={4} classNames={classes.awardNameImg}>
          <div className={classes.imageContainer}>
            <img className={classes.image} src={award.image} alt="avatar" />
          </div>

          <Text type="subtitle">{award.name}</Text>
        </Group>

        {/* // TODO: where are we getting currency type from on single award? */}
        <Text type="body">
          <TruncateThousands amount={amount} decimals={1} /> {award.symbol}
        </Text>
      </Group>
    </div>
  );
};

export default AwardCard;
