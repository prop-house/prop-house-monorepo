import classes from './DualSectionSelector.module.css';
import React, { Dispatch, ReactNode, SetStateAction } from 'react';
import { updateRound } from '../../../state/slices/round';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';

const DualSectionSelector: React.FC<{
  children: ReactNode;
  setActiveSection: Dispatch<SetStateAction<number>>;
  dataToBeCleared: any;
}> = props => {
  const { children, setActiveSection, dataToBeCleared } = props;
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const clearRoundState = () => dispatch(updateRound({ ...round, ...dataToBeCleared }));

  return (
    <div className={classes.container}>
      {React.Children.map(children, (child, index) => (
        <div
          className={classes.section}
          onClick={() => {
            // Reset parts of the round's state when switching between sections
            clearRoundState();

            setActiveSection(index);
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default DualSectionSelector;
