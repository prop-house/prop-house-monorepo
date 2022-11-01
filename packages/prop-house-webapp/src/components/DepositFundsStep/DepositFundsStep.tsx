import DepositFundsModule from '../DepositFundsModule/DepositFundsModule';
import Divider from '../Divider';
import RewardTypeModule from '../RewardTypeModule/RewardTypeModule';
import classes from './DepositFundsStep.module.css';

const DepositFundsStep = () => {
  return (
    <>
      <p className={classes.title}>Deposit funds for your house</p>
      <Divider />
      <RewardTypeModule />
      <Divider />
      <DepositFundsModule />
    </>
  );
};

export default DepositFundsStep;
