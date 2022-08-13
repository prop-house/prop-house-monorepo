import classes from './HouseCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredAuction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
// import { useNavigate } from 'react-router-dom';
import StatusPill from '../StatusPill';

const HouseCard: React.FC<{
  round: StoredAuction;
}> = props => {
  const { round } = props;
  // const { t } = useTranslation();

  // let navigate = useNavigate();

  return (
    <>
      <div
        onClick={e => {
          // if (e.metaKey || e.ctrlKey) {
          //   window.open(`/proposal/${proposal.id}`, `_blank`); // open in new tab
          // } else {
          //   navigate(`/proposal/${proposal.id}`);
          // }
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

            <div className={classes.truncatedTldr}>
              {/* {round.title} */}
              Mandated round inviting builders to build alternative Nouns Clients. Builders can
              propose any idea to corresponds to the specified mandate.
            </div>
          </div>

          <div className={classes.roundInfo}>
            <div className={clsx(classes.section, classes.funding)}>
              <p className={classes.title}>Funding</p>
              <p className={classes.info}>
                <span className="">999 ETH</span>
                <span className={classes.xDivide}>{' x '}</span>
                <span className="">99</span>
              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <p className={classes.title}>Voting ends</p>
              <p className={classes.info}>August 99</p>
            </div>

            <div className={clsx(classes.divider, classes.propSection)}></div>

            <div className={clsx(classes.section, classes.propSection)}>
              <p className={classes.title}>Proposals</p>
              <p className={classes.info}>9999</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default HouseCard;
