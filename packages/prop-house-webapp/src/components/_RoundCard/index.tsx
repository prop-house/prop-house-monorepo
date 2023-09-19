import classes from './RoundCard.module.css';
import { RoundWithHouse } from '@prophouse/sdk-react';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import EthAddress from '../EthAddress';
import AwardsDisplay from '../AwardsDisplay';
import { useNavigate } from 'react-router-dom';
import { nameToSlug } from '../../utils/communitySlugs';

const RoundCard_: React.FC<{ round: RoundWithHouse }> = props => {
  const { round } = props;

  let navigate = useNavigate();

  return (
    <div
      onClick={e => {
        navigate(`/${nameToSlug(round.address)}`);
      }}
    >
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={classes.roundCard}
      >
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
            <AwardsDisplay awards={round.config.awards} />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RoundCard_;
