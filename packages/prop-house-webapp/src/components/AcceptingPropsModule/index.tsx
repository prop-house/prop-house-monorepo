import { Auction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { MdOutlineLightbulb as BulbIcon } from 'react-icons/md';

import classes from './AcceptingPropsModule.module.css';

export interface AcceptingPropsModuleProps {
  auction: Auction;
  communityName: string;
}
const AcceptingPropsModule: React.FC<AcceptingPropsModuleProps> = (
  props: AcceptingPropsModuleProps,
) => {
  const { auction, communityName } = props;

  return (
    <>
      <div className={classes.sideCardHeader}>
        <div className={clsx(classes.icon, classes.greenIcon)}>
          <BulbIcon />
        </div>
        <div className={classes.textContainer}>
          <p className={classes.title}>{`Accepting proposals`}</p>
          <p className={classes.subtitle}>
            Until {dayjs(auction.proposalEndTime).format('MMMM D')}
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      <p className={classes.sideCardBody}>
        <b>How proposing works:</b>

        <div className={classes.bulletList}>
          <div className={classes.bulletItem}>
            <hr className={classes.bullet} />
            <p>Anyone can submit a proposal to get funded.</p>
          </div>

          <div className={classes.bulletItem}>
            <hr className={classes.bullet} />
            <p>
              Owners of the <b>{communityName}</b> token will vote on the best proposals.
            </p>
          </div>

          <div className={classes.bulletItem}>
            <hr className={classes.bullet} />
            <p>
              The top <b>{auction.numWinners}</b>{' '}
              {auction.numWinners === 1 ? 'proposal' : 'proposals'} will get funded{' '}
              <b>
                {auction.fundingAmount} {auction.currencyType}{' '}
              </b>
              each.
            </p>
          </div>
        </div>
      </p>
    </>
  );
};

export default AcceptingPropsModule;
