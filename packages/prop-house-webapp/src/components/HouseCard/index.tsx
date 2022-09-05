import classes from './HouseCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import {
  auctionStatus,
  AuctionStatus,
  DeadlineCopy,
  deadlineTime,
} from '../../utils/auctionStatus';
import { useNavigate } from 'react-router-dom';
import StatusPill from '../StatusPill';
import { nameToSlug } from '../../utils/communitySlugs';
import diffTime from '../../utils/diffTime';
import { useTranslation } from 'react-i18next';

const HouseCard: React.FC<{
  round: StoredAuction;
}> = props => {
  const { round } = props;
  const { t } = useTranslation();
  let navigate = useNavigate();

  return (
    <>
      <div
        onClick={e => {
          if (e.metaKey || e.ctrlKey) {
            window.open(`${window.location.href}/${nameToSlug(round.title)}`, `_blank`); // open in new tab
          } else {
            navigate(`${nameToSlug(round.title)}`, {
              replace: false,
              state: { round },
            });
          }
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(
            auctionStatus(round) === AuctionStatus.AuctionEnded && classes.roundEnded,
            classes.houseCard,
          )}
        >
          <div className={classes.textContainter}>
            <div className={classes.titleContainer}>
              <div className={classes.authorContainer}>{round.title}</div>
              <StatusPill status={auctionStatus(round)} />
            </div>

            <div className={classes.truncatedTldr}>{round.description}</div>
          </div>

          <div className={classes.roundInfo}>
            <div className={clsx(classes.section, classes.funding)}>
              <p className={classes.title}>{t('funding')}</p>
              <p className={classes.info}>
                <span className="">
                  {round.fundingAmount} {round.currencyType}
                </span>
                <span className={classes.xDivide}>{' x '}</span>
                <span className="">{round.numWinners}</span>
              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <p className={classes.title}>{DeadlineCopy(round)}</p>
              <p className={classes.info}>{diffTime(deadlineTime(round))}</p>
            </div>

            <div className={clsx(classes.divider, classes.propSection)}></div>

            <div className={clsx(classes.section, classes.propSection)}>
              <p className={classes.title}> {t('proposals2')}</p>
              <p className={classes.info}>{round.proposals.length}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default HouseCard;
