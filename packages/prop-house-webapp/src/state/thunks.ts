import { Dispatch } from 'redux';
import { NewRound, checkStepCriteria, updateRound } from './slices/round';

// this will update the round and check if the next step should be enabled
export const saveRound = (newRound: NewRound) => {
  return (dispatch: Dispatch) => {
    dispatch(updateRound(newRound));
    dispatch(checkStepCriteria());
  };
};
