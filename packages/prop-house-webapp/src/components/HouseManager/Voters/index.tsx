import classes from './Voters.module.css';
import Group from '../Group';
import {
  DefaultVotingConfigs,
  VotingStrategyConfig,
  VotingStrategyType,
} from '@prophouse/sdk-react';
import Button, { ButtonColor } from '../../Button';
import Voter from '../Voter';
import { FC } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import clsx from 'clsx';
import { saveRound } from '../../../state/thunks';
import Text from '../Text';
import OverflowScroll from '../OverflowScroll';

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
  setUploadMessage?: (message: string) => void;
  setCurrentView?: (view: 'showVoters' | 'addVoters') => void;
  setShowVotersModal?: (show: boolean) => void;
  setShowUploadCSVModal?: (show: boolean) => void;
  displayCount?: number;
  setDisplayCount?: (count: number) => void;
}> = props => {
  const {
    editMode,
    voters,
    setVoters,
    setUploadMessage,
    setCurrentView,
    setShowVotersModal,
    setShowUploadCSVModal,
    displayCount,
    setDisplayCount,
  } = props;

  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleRemoveVoter = (address: string, type: string) => {
    if (!editMode) setUploadMessage!('');

    if (type === VotingStrategyType.VANILLA) return;

    let updatedVoters: DefaultVotingConfigs[] = [...voters];

    if (type === VotingStrategyType.WHITELIST) {
      // Find existing Whitelist strategy
      const existingStrategyIndex = voters.findIndex(
        existingStrategy => existingStrategy.strategyType === VotingStrategyType.WHITELIST,
      );

      if (existingStrategyIndex > -1) {
        const existingStrategy = voters[existingStrategyIndex];

        // Type guard to ensure existing strategy is a Whitelist strategy
        if ('members' in existingStrategy) {
          // if there's only one member left, remove the entire "Voter" by returning an empty array
          if (existingStrategy.members.length === 1) {
            updatedVoters = [
              ...voters.slice(0, existingStrategyIndex),
              ...voters.slice(existingStrategyIndex + 1),
            ];
          } else {
            // otherwise, remove the member from the "Voter"
            const updatedStrategy = {
              ...existingStrategy,
              members: existingStrategy.members.filter(m => m.address !== address),
            };
            updatedVoters = [
              ...voters.slice(0, existingStrategyIndex),
              updatedStrategy,
              ...voters.slice(existingStrategyIndex + 1),
            ];
          }
        } else {
          console.error('Invalid strategy type');
        }
      } else {
        console.error('No whitelist strategy found');
      }
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

    if (editMode) return;

    // After the voter is removed, check if all visible voters have been removed
    let visibleCount = 0;

    updatedVoters.forEach(voter => {
      if (voter.strategyType === VotingStrategyType.WHITELIST && voter.members) {
        visibleCount += Math.min(voter.members.length, displayCount!);
      } else {
        visibleCount += 1;
      }
    });

    // If all visible voters have been removed, increase the displayCount to show the next 10 (or as many as there are remaining)
    if (visibleCount === 0) setDisplayCount!(Math.min(getVoterCount(), displayCount! + 10));
  };

  // this is used to determine whether or not we should show the "View X more voter(s)" link
  const getVoterCount = () => {
    return voters.reduce((count, voter) => {
      if (voter.strategyType === VotingStrategyType.WHITELIST && 'members' in voter) {
        // Add the number of members to the count
        return count + voter.members.length;
      } else {
        // If voter is not a whitelist strategy, add 1 to the count
        return count + 1;
      }
    }, 0);
  };

  const handleShowMoreVoters = () => setDisplayCount!(getVoterCount());

  return (
    <>
      <OverflowScroll>
        <Group gap={12} mb={12} classNames={classes.voters}>
          {(editMode ? voters : voters.slice(0, displayCount)).map((s, idx) =>
            // not supported
            s.strategyType === VotingStrategyType.VANILLA ? (
              <></>
            ) : // if it's a whitelist, we need to map over the members
            s.strategyType === VotingStrategyType.WHITELIST ? (
              (editMode ? s.members : s.members.slice(0, displayCount)).map((m, idx) => (
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
      </OverflowScroll>

      {/* This will only show if there are more than 10 voters and the display count is less than the total number of voters */}
      {!editMode && getVoterCount() > 10 && displayCount !== getVoterCount() && (
        <Group mb={12}>
          <Text type="link" onClick={handleShowMoreVoters} classNames={classes.message}>
            {`Show ${getVoterCount() - displayCount!} more ${
              getVoterCount() - displayCount! === 1 ? 'voter' : 'voters'
            }`}
          </Text>
        </Group>
      )}

      <Group row gap={6} mb={18} classNames={clsx(editMode && classes.editModeButtons)}>
        <Button
          text={'Add a voter'}
          bgColor={ButtonColor.Pink}
          onClick={() => {
            if (!editMode) setUploadMessage!('');
            setCurrentView ? setCurrentView('addVoters') : setShowVotersModal!(true);
          }}
        />

        {editMode ? (
          <Button
            text={'Cancel'}
            bgColor={ButtonColor.White}
            onClick={() => setShowVotersModal!(false)}
          />
        ) : (
          <Button
            text={'Upload CSV'}
            bgColor={ButtonColor.White}
            onClick={() => {
              setUploadMessage!('');
              setShowUploadCSVModal!(true);
            }}
          />
        )}
      </Group>
    </>
  );
};

export default Voters;
