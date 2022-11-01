import classes from './SetupRoundStep.module.css';
import Divider from '../Divider';
import SetupRoundInfo from '../SetupRoundInfo';
import SetupRoundDetails from '../SetupRoundDetails';

const SetupRoundStep = () => {
  return (
    <>
      <p className={classes.title}>Set up your first round</p>
      <Divider />
      <SetupRoundInfo />
      <Divider />
      <SetupRoundDetails />
    </>
  );
};

export default SetupRoundStep;
