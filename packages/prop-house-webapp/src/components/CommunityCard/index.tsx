import { jsNumberForAddress } from 'react-jazzicon';
import classes from './CommunityCard.module.css';
import { House } from '@prophouse/sdk-react';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import Card, { CardBgColor, CardBorderRadius } from '../Card';

const CommunityCard: React.FC<{
  house: House;
}> = props => {
  const { house } = props;

  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.ten}
      classNames={classes.cardContainer}
    >
      {house.imageURI?.includes('prop.house') ? (
        <img
          src={house.imageURI?.replace(/prophouse.mypinata.cloud/g, 'cloudflare-ipfs.com')}
          alt="house profile"
          className={classes.image}
        />
      ) : (
        <span style={{ marginRight: 6 }}>
          <Jazzicon diameter={20} seed={jsNumberForAddress(house.address)} />
        </span>
      )}
      <div className={classes.name}>{house.name}</div>
    </Card>
  );
};

export default CommunityCard;
