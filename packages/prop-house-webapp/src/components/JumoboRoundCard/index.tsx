import classes from './JumboRoundCard.module.css';
import { House, Round, usePropHouse } from '@prophouse/sdk-react';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import EthAddress from '../EthAddress';
import { useNavigate } from 'react-router-dom';
import AwardLabels from '../AwardLabels';
import { useEffect, useState } from 'react';
import Modal from '../Modal';
import useFullRoundAwards from '../../hooks/useFullRoundAwards';
import LoadingIndicator from '../LoadingIndicator';
import { Col } from 'react-bootstrap';
import StatusPill, { StatusPillColor } from '../StatusPill';
import { shortFromNow } from '../../utils/shortenFromNow';
import Button, { ButtonColor } from '../Button';
import { IoTime } from 'react-icons/io5';
import { HiDocument } from 'react-icons/hi';
import { FaClipboardCheck } from 'react-icons/fa';
import { HiTrophy } from 'react-icons/hi2';
import Avatar from '../Avatar';

const JumboRoundCard: React.FC<{ round: Round; house: House }> = props => {
  const { round, house } = props;

  let navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loadingSymbols, loadingDecimals, fullRoundAwards] = useFullRoundAwards(
    round.config.awards,
  );
  const propHouse = usePropHouse();
  const [numProps, setNumProps] = useState<number | undefined>();

  useEffect(() => {
    if (numProps) return;
    const fetchProps = async () => {
      try {
        setNumProps(await propHouse.query.getRoundProposalCount(round.address));
      } catch (e) {
        console.log(e);
      }
    };
    fetchProps();
  });

  const awardsModalContent = (
    <div className={classes.awardsModalContentContainer}>
      {loadingSymbols || loadingDecimals ? (
        <LoadingIndicator />
      ) : (
        fullRoundAwards &&
        fullRoundAwards.map((award, i) => {
          return (
            <div key={i}>
              <span className={classes.place}>
                {i + 1}
                {i < 2 ? 'st' : 'th'} place:
              </span>{' '}
              <span className={classes.amountAndSymbol}>
                {award.parsedAmount} {award.symbol}
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
          <Col className={classes.leftCol}>
            <div className={classes.roundCreatorAndTitleContainer}>
              <div className={classes.roundCreator}>
                <EthAddress
                  address={house.address}
                  imgSrc={house.imageURI?.replace(
                    /prophouse.mypinata.cloud/g,
                    'cloudflare-ipfs.com',
                  )}
                  addAvatar={true}
                  className={classes.roundCreator}
                />
              </div>
              <div className={classes.roundTitle}>
                {round.title[0].toUpperCase() + round.title.slice(1)}
              </div>
            </div>
            <div className={classes.statusItemContainer}>
              <div className={classes.item}>
                <div className={classes.title}>
                  <FaClipboardCheck /> Status
                </div>
                <div className={classes.content}>
                  <StatusPill copy={'Proposing'} color={StatusPillColor.Green} />
                </div>
              </div>
              <div className={classes.item}>
                <div className={classes.title}>
                  <IoTime />
                  Time left
                </div>
                <div className={classes.content}>
                  {shortFromNow(round.config.proposalPeriodEndTimestamp * 1000)}
                </div>
              </div>
              <div className={classes.item}>
                <div className={classes.title}>
                  <HiDocument /> Created
                </div>
                <div className={classes.content}>{numProps} props</div>
              </div>
            </div>
          </Col>
          <Col className={classes.rightCol}>
            <div className={classes.awardsContainer}>
              <div className={classes.title}>
                <HiTrophy size={14} color={'C0C0C0'} />
                Awards
              </div>
              <AwardLabels awards={round.config.awards} setShowModal={setShowModal} size={18} />
            </div>
            <div className={classes.bottomContainer}>
              <div className={classes.activeAccounts}>
                <Avatar address={'0xb0dd496FffFa300df1EFf42702066aCa81834404'} diameter={12} />
                <Avatar address={'0xb0dd496FffFa300df1EFf42702066aCa81834404'} diameter={12} />
                <Avatar address={'0xb0dd496FffFa300df1EFf42702066aCa81834404'} diameter={12} />
                &nbsp;<span>toastee.eth</span>&nbsp;and&nbsp;<span>10others</span>
                &nbsp;proposed
              </div>
              <Button text="View round" bgColor={ButtonColor.Purple} />
            </div>
          </Col>
        </div>
      </Card>
    </div>
  );
};

export default JumboRoundCard;
