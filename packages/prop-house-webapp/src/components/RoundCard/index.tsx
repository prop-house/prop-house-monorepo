import classes from './RoundCard.module.css';
import { House, Round } from '@prophouse/sdk-react';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import EthAddress from '../EthAddress';
import { useNavigate } from 'react-router-dom';
import AwardLabels from '../AwardLabels';
import { useState } from 'react';
import Modal from '../Modal';
import useAssetsWithMetadata from '../../hooks/useAssetsWithMetadata';
import LoadingIndicator from '../LoadingIndicator';
import RoundCardStatusBar from '../RoundCardStatusBar';

const RoundCard: React.FC<{ round: Round; house: House; displayBottomBar: boolean }> = props => {
  const { round, house, displayBottomBar } = props;

  let navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, assetsWithMetadata] = useAssetsWithMetadata(round.config.awards);

  const awardsModalContent = (
    <div className={classes.awardsModalContentContainer}>
      {loading ? (
        <LoadingIndicator />
      ) : (
        assetsWithMetadata &&
        assetsWithMetadata.map((asset, i) => {
          return (
            <div key={i}>
              <span className={classes.place}>
                {i + 1}
                {i < 2 ? 'st' : 'th'} place:
              </span>{' '}
              <span className={classes.amountAndSymbol}>
                {asset.parsedAmount} {asset.symbol}
              </span>
            </div>
          );
        })
      )}
    </div>
  );

  return showModal ? (
    <Modal
      modalProps={{
        title: 'Awards',
        subtitle: 'See all awards',
        setShowModal: setShowModal,
        body: awardsModalContent,
      }}
    />
  ) : (
    <div onClick={e => navigate(`/${round.address}`)}>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={classes.roundCard}
        onHoverEffect={true}
      >
        <div className={classes.container}>
          <div className={classes.roundCreatorAndTitleContainer}>
            <div className={classes.roundCreator}>
              <EthAddress
                address={house.address}
                imgSrc={house.imageURI?.replace(/prophouse.mypinata.cloud/g, 'cloudflare-ipfs.com')}
                addAvatar={true}
                className={classes.roundCreator}
              />
            </div>
            <div className={classes.roundTitle}>
              {round.title[0].toUpperCase() + round.title.slice(1)}
            </div>
          </div>
          <AwardLabels awards={round.config.awards} setShowModal={setShowModal} />
        </div>
      </Card>
      {displayBottomBar && <RoundCardStatusBar round={round} />}
    </div>
  );
};

export default RoundCard;
