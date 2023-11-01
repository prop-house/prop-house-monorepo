import { jsNumberForAddress } from 'react-jazzicon';
import classes from './CommunityCard.module.css';
import { House } from '@prophouse/sdk-react';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { useNavigate } from 'react-router-dom';

const CommunityCard: React.FC<{
  house: House;
}> = props => {
  const { house } = props;
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(`/${house.address}`)}>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.ten}
        classNames={classes.cardContainer}
        onHoverEffect={true}
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
    </div>
  );
};

export default CommunityCard;
