import classes from './Voters.module.css';
import Group from '../Group';
import { VotingStrategyConfig, VotingStrategyType } from '@prophouse/sdk-react';
import Button, { ButtonColor } from '../../Button';
import Voter from '../Voter';
import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import clsx from 'clsx';
import { saveRound } from '../../../state/thunks';

/**
 * @see editMode is used to determine whether or not we're editing from Step 6,
 * in which case we don't want to dispatch the saveRound thunk, rather we want to
 * track the changes in the parent component and dispatch the saveRound thunk
 * when the user clicks "Save Changes"
 */

const Voters: FC<{
  editMode?: boolean;
  voters: VotingStrategyConfig[];
  setVoters: (voters: VotingStrategyConfig[]) => void;
  setCurrentView?: (view: 'showVoters' | 'addVoters') => void;
  setShowVotersModal?: (show: boolean) => void;
}> = props => {
  const { editMode, voters, setVoters, setCurrentView, setShowVotersModal } = props;

  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleRemoveVoter = (address: string, type: string) => {
    if (type === VotingStrategyType.VANILLA) return;

    let updatedVoters;

    if (type === VotingStrategyType.WHITELIST) {
      // we use flatMap because we need to remove the entire "Voter" if there's only one member left
      updatedVoters = voters.flatMap(s => {
        if (s.strategyType === VotingStrategyType.WHITELIST) {
          // if there's only one member left, remove the entire "Voter" by returning an empty array
          if (s.members.length === 1) {
            return [];
          } else {
            // otherwise, remove the member from the "Voter"
            return {
              ...s,
              members: s.members.filter(m => m.address !== address),
            };
          }
        } else {
          // if it's not a whitelist, just return the "Voter"
          return s;
        }
      });
    } else {
      updatedVoters = voters.filter(s => {
        // we do this because the Whitelist type doesn't have an address field
        // this ensures that we don't remove the wrong "Voter"
        if ('address' in s) {
          return s.address !== address;
        } else {
          return true;
        }
      });
    }

    dispatch(saveRound({ ...round, voters: updatedVoters }));
    setVoters(updatedVoters);
  };

  return (
    <>
      <Group gap={12} mb={12}>
        {voters.map((s, idx) =>
          // not supported
          s.strategyType === VotingStrategyType.VANILLA ? (
            <></>
          ) : // if it's a whitelist, we need to map over the members
          s.strategyType === VotingStrategyType.WHITELIST ? (
            s.members.map((m, idx) => (
              <Voter
                key={idx}
                type={s.strategyType}
                address={m.address}
                multiplier={Number(m.votingPower)}
                isDisabled={editMode && s.members.length === 1}
                removeVoter={handleRemoveVoter}
              />
            ))
          ) : (
            // otherwise, proceed as normal
            <Voter
              key={idx}
              type={s.strategyType}
              address={s.address}
              multiplier={s.multiplier}
              isDisabled={editMode && voters.length === 1}
              removeVoter={handleRemoveVoter}
            />
          ),
        )}
      </Group>

      <Group row gap={6} mb={18} classNames={clsx(editMode && classes.editModeButtons)}>
        <Button
          onClick={() => {
            setCurrentView ? setCurrentView('addVoters') : setShowVotersModal!(true);
          }}
          text={'Add a voter'}
          bgColor={ButtonColor.Pink}
        />

        {editMode ? (
          <Button
            onClick={() => setShowVotersModal!(false)}
            text={'Cancel'}
            bgColor={ButtonColor.White}
          />
        ) : (
          <Button
            // TODO: Add CSV upload functionality
            text={'Upload CSV'}
            bgColor={ButtonColor.White}
          />
        )}
      </Group>
    </>
  );
};

export default Voters;
