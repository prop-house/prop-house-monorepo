import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Button, { ButtonColor } from '../Button';

export const emptyCard = (copy: string) => (
  <Card
    bgColor={CardBgColor.LightPurple}
    borderRadius={CardBorderRadius.twenty}
    classNames={classes.noPropCard}
  >
    <>{copy}</>
  </Card>
);
export const auctionNotStartedContent = emptyCard(
  'Submission of proposals will be enabled once the funding round begins. Proposals will show up here.'
);
export const auctionEmptyContent = emptyCard(
  'Submitted proposals will show up here.'
);

// alert to get nouners to connect when auctions in voting stage
export const disconnectedCopy = (onClick: () => void, houseName: string) => (
  <div className={classes.alertWrapper}>
    <div style={{ margin: '0rem 1rem 0rem 0rem' }}>
      <h4
        style={{
          fontSize: '22px',
          fontWeight: 'bold',
          margin: '0rem 0rem 0.25rem 0rem',
        }}
      >
        Voting is open
      </h4>
      <p>
        The voting period is now open. Members of the ${houseName} ecosystem can
        vote for proposals.
      </p>
    </div>
    <Button text="Connect" bgColor={ButtonColor.Pink} onClick={onClick} />
  </div>
);

// alert verifying that connected wallet is a eligible to vote
export const connectedCopy = (
  <div className={classes.connectedCopy}>
    You are eligible to vote! Cast your vote for the proposal you believe should
    receive funding.
  </div>
);
