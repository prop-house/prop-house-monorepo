import classes from './UserCardHeader.module.css';
import isWinner from '../../utils/isWinner';
import Button, { ButtonColor } from '../Button';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Proposal, RoundState } from '@prophouse/sdk-react';

const UserCardHeader: React.FC<{
  state: RoundState;
  amountOfPropsWon: number;
  userProps: Proposal[];
  cardIndex: number;
  setCardIndex: Dispatch<SetStateAction<number>>;
  winningIds: number[];
}> = props => {
  const { state, amountOfPropsWon, userProps, winningIds, cardIndex, setCardIndex } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className={classes.sideCardHeader}>
        <div className={classes.textContainer}>
          <p className={classes.subtitle}>
            {state >= RoundState.IN_CLAIMING_PERIOD
              ? amountOfPropsWon > 0 && isWinner(winningIds, userProps[cardIndex].id)
                ? `${t('your')} ${amountOfPropsWon > 1 ? t('proposal') : t('proposals')} ${t(
                  'won',
                )}!`
                : `${t('your')} ${userProps.length === 1 ? t('proposal') : t('proposals')}`
              : `${t('your')} ${userProps.length === 1 ? t('proposal') : t('proposals')}`}
          </p>

          <div className={classes.titleAndVoteBtns}>
            <p className={classes.title}>{userProps[cardIndex].title}</p>
            {userProps.length > 1 && (
              <div className={classes.votesModuleContainer}>
                <Button
                  text="←"
                  bgColor={ButtonColor.Gray}
                  onClick={() => setCardIndex(cardIndex - 1)}
                  classNames={classes.voteBtn}
                  disabled={cardIndex === 0}
                />

                <Button
                  text="→"
                  bgColor={ButtonColor.Gray}
                  onClick={() => setCardIndex(cardIndex + 1)}
                  classNames={classes.voteBtn}
                  disabled={cardIndex === userProps.length - 1}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className={classes.divider} />
    </>
  );
};
export default UserCardHeader;
