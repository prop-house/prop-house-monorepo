import classes from './VotingStrategies.module.css';
import Group from '../Group';
import { VotingStrategyConfig, VotingStrategyType } from '@prophouse/sdk-react';
import Button, { ButtonColor } from '../../Button';
import VotingStrategy from '../VotingStrategy';
import { FC } from 'react';
import { checkStepCriteria, updateRound } from '../../../state/slices/round';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import clsx from 'clsx';

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
      updatedStrategies = strategies.flatMap(s => {
        if (s.strategyType === VotingStrategyType.WHITELIST) {
          // If there's only one member left, remove the entire strategy
          if (s.members.length === 1) {
            return [];
          } else {
            return {
              ...s,
              members: s.members.filter(m => m.address !== address),
            };
          }
        } else {
          return s;
        }
      });
    } else {
      updatedStrategies = strategies.filter(s => {
        if ('address' in s) {
          return s.address !== address;
        } else {
          return true;
        }
      });
    }

    dispatch(updateRound({ ...round, strategies: updatedStrategies }));
    dispatch(checkStepCriteria());
    setStrategies(updatedStrategies);
  };

  return (
    <>
      <Group gap={12} mb={12}>
        {strategies.map((s, idx) =>
          s.strategyType === VotingStrategyType.VANILLA ? (
            <></>
          ) : s.strategyType === VotingStrategyType.WHITELIST ? (
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
            // setShowModal(true);
            // setCurrentView('addStrategies');
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
            // TODO
            // onClick={() => setShowModal(true)}
            text={'Upload CSV'}
            bgColor={ButtonColor.White}
          />
        )}
      </Group>
    </>
  );
};

export default VotingStrategies;
