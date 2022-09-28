import classes from './RoundCard.module.css';
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
import Tooltip from '../Tooltip';
import dayjs from 'dayjs';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { useAppDispatch } from '../../hooks';
import { setActiveRound } from '../../state/slices/propHouse';

const RoundCard: React.FC<{
  round: StoredAuction;
}> = props => {
  const { round } = props;
  const { t } = useTranslation();
  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  return (
    <>
      <div
        onClick={e => {
          dispatch(setActiveRound(round));
          if (cmdPlusClicked(e)) {
            openInNewTab(`${window.location.href}/${nameToSlug(round.title)}`);
            return;
          }
          navigate(`${nameToSlug(round.title)}`);
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(
            auctionStatus(round) === AuctionStatus.AuctionEnded && classes.roundEnded,
            classes.roundCard,
          )}
        >
          <div className={classes.textContainer}>
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
                <span className={classes.xDivide}>{' × '}</span>
                <span className="">{round.numWinners}</span>
              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <Tooltip
                content={
                  <>
                    <p className={classes.title}>{DeadlineCopy(round)}</p>
                    <p className={classes.info}>
                      {diffTime(deadlineTime(round)).replace('months', 'mos')}{' '}
                    </p>
                  </>
                }
                tooltipContent={`${dayjs(deadlineTime(round))
                  .tz()
                  .format('MMMM D, YYYY h:mm A z')}`}
              />
            </div>

            <div className={clsx(classes.divider, classes.propSection)}></div>

            <div className={clsx(classes.section, classes.propSection)}>
              <p className={classes.title}> {t('proposals2')}</p>
              <p className={classes.info}>{round.numProposals}</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default RoundCard;
