import classes from './UserCardFooter.module.css';
import isWinner from '../../utils/isWinner';
import { useNavigate } from 'react-router-dom';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { useTranslation } from 'react-i18next';
import { Proposal, RoundState } from '@prophouse/sdk-react';

const UserCardFooter: React.FC<{
  state: RoundState;
  amountOfPropsWon: number;
  userProps: Proposal[];
  winningIds: number[];
  cardIndex: number;
}> = props => {
  const { state, amountOfPropsWon, userProps, winningIds, cardIndex } = props;
  const { t } = useTranslation();

  let navigate = useNavigate();

  return (
    <>
      {/* TODO: No longer valid. Need claiming UI. */}
      {state >= RoundState.IN_CLAIMING_PERIOD &&
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
