import classes from './RoundCard.module.css';
import { RoundWithHouse } from '@prophouse/sdk-react';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import StatusPill, { StatusPillColor } from '../StatusPill';
import EthAddress from '../EthAddress';

const RoundCard_: React.FC<{ round: RoundWithHouse }> = props => {
  const { round } = props;

  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
      <div className={classes.container}>
        <div className={classes.title}>{round.title}</div>
        <div className={classes.creatorAndAwardContainer}>
          <EthAddress
            address={round.house.address}
            imgSrc={round.house.imageURI?.replace(
              /prophouse.mypinata.cloud/g,
              'cloudflare-ipfs.com',
            )}
            addAvatar={true}
            className={classes.roundCreator}
          />
          <StatusPill copy={'$250k'} color={StatusPillColor.Green} size={18} />
        </div>
      </div>
    </Card>
  );
};

export default RoundCard_;
