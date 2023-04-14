import classes from './VotingStrategies.module.css';
import Group from '../Group';
import { VotingStrategyConfig, VotingStrategyType } from '@prophouse/sdk-react';
import Button, { ButtonColor } from '../../Button';
import VotingStrategy from '../VotingStrategy';
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

const VotingStrategies: FC<{
  editMode?: boolean;
  strategies: VotingStrategyConfig[];
  setStrategies: (strategies: VotingStrategyConfig[]) => void;
  setCurrentView?: (view: 'showStrategies' | 'addStrategies') => void;
  setShowVotingStrategyModal?: (show: boolean) => void;
}> = props => {
  const { editMode, strategies, setStrategies, setCurrentView, setShowVotingStrategyModal } = props;

  const dispatch = useAppDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleRemoveStrategy = (address: string, type: string) => {
    if (type === VotingStrategyType.VANILLA) return;

    let updatedStrategies;

    if (type === VotingStrategyType.WHITELIST) {
      // we use flatMap because we need to remove the entire strategy if there's only one member left
      updatedStrategies = strategies.flatMap(s => {
        if (s.strategyType === VotingStrategyType.WHITELIST) {
          // if there's only one member left, remove the entire strategy by returning an empty array
          if (s.members.length === 1) {
            return [];
          } else {
            // otherwise, remove the member from the strategy
            return {
              ...s,
              members: s.members.filter(m => m.address !== address),
            };
          }
        } else {
          // if it's not a whitelist, just return the strategy
          return s;
        }
      });
    } else {
      updatedStrategies = strategies.filter(s => {
        // we do this because the Whitelist type doesn't have an address field
        // this ensures that we don't remove the wrong strategy
        if ('address' in s) {
          return s.address !== address;
        } else {
          return true;
        }
      });
    }

    dispatch(saveRound({ ...round, strategies: updatedStrategies }));
    setStrategies(updatedStrategies);
  };

  return (
    <>
      <Group gap={12} mb={12}>
        {strategies.map((s, idx) =>
          // not supported
          s.strategyType === VotingStrategyType.VANILLA ? (
            <></>
          ) : // if it's a whitelist, we need to map over the members
          s.strategyType === VotingStrategyType.WHITELIST ? (
            s.members.map((m, idx) => (
              <VotingStrategy
                key={idx}
                type={s.strategyType}
                address={m.address}
                multiplier={Number(m.votingPower)}
                isDisabled={editMode && s.members.length === 1}
                removeStrategy={handleRemoveStrategy}
              />
            ))
          ) : (
            // otherwise, proceed as normal
            <VotingStrategy
              key={idx}
              type={s.strategyType}
              address={s.address}
              multiplier={s.multiplier}
              isDisabled={editMode && strategies.length === 1}
              removeStrategy={handleRemoveStrategy}
            />
          ),
        )}
      </Group>

      <Group row gap={6} mb={18} classNames={clsx(editMode && classes.editModeButtons)}>
        <Button
          onClick={() => {
            setCurrentView ? setCurrentView('addStrategies') : setShowVotingStrategyModal!(true);
          }}
          text={'Add a strategy'}
          bgColor={ButtonColor.Pink}
        />

        {editMode ? (
          <Button
            onClick={() => setShowVotingStrategyModal!(false)}
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

export default VotingStrategies;
