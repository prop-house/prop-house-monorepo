import Card, { CardBgColor, CardBorderRadius } from '../Card';
import DeployContractStep from '../DeployContractStep';
import DepositFundsStep from '../DepositFundsStep/DepositFundsStep';
import SetupRoundStep from '../SetupRoundStep';
import classes from './ManagerPrimaryCard.module.css';

const ManagerPrimaryCard: React.FC<{
  activeStep: number;
}> = props => {
  const { activeStep } = props;

  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.primaryCard}
      >
        {activeStep === 1 && <DeployContractStep />}
        {activeStep === 2 && <DepositFundsStep />}
        {activeStep === 3 && <SetupRoundStep />}
      </Card>
    </>
  );
};

export default ManagerPrimaryCard;
