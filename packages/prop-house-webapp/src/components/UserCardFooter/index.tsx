import classes from './UserCardFooter.module.css';
import isWinner from '../../utils/isWinner';
import { useNavigate } from 'react-router-dom';
import { AuctionStatus } from '../../utils/auctionStatus';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { useTranslation } from 'react-i18next';

const UserCardFooter: React.FC<{
  status: AuctionStatus;
  amountOfPropsWon: number;
  userProps: StoredProposalWithVotes[];
  winningIds: number[];
  cardIndex: number;
}> = props => {
  const { status, amountOfPropsWon, userProps, winningIds, cardIndex } = props;
  const { t } = useTranslation();

  let navigate = useNavigate();

  return (
    <>
      {status === AuctionStatus.AuctionEnded &&
        amountOfPropsWon > 0 &&
        winningIds &&
        isWinner(winningIds, userProps[cardIndex].id) ? (
        <>
          <p className={classes.sideCardBody}>
            <b>{t('whatsNext')}:</b>

            <div className={classes.bulletList}>
              <div className={classes.bulletItem}>
                <hr className={classes.bullet} />
                <p>{t('fundsWillBeSent')}.</p>
              </div>
            </div>
          </p>
        </>
      ) : (
        <div
          onClick={e => {
            if (cmdPlusClicked(e)) {
              openInNewTab(`${window.location.href}/${userProps[cardIndex].id}`);
              return;
            }
            navigate(`${userProps[cardIndex].id}`);
          }}
          className={classes.viewProposal}
        >
          {t('view')}
        </div>
      )}
    </>
  );
};
export default UserCardFooter;
