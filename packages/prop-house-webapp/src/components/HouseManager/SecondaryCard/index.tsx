import classes from './SecondaryCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import CreateRoundStep from '../../CreateRoundStep';
import { useAppSelector } from '../../../hooks';

const SecondaryCard: React.FC = () => {
  const activeStep = useAppSelector(state => state.createRound.activeStep);

  const steps = [
    {
      title: 'Name the round',
      text: 'Set the name and description',
    },
    {
      title: 'Set who can participate',
      text: 'Define who can vote in your round',
    },
    {
      title: 'Set the awards',
      text: 'Specific the number of winners and their rewards for the round',
    },
    {
      title: 'Round timing',
      text: 'Set how long the round should be',
    },
    {
      title: 'Create the round 🎉',
      text: 'Review the settings for the round and create it',
    },
  ];

  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.secondaryCard}
      >
        {steps.map((step, idx) => (
          <>
            <CreateRoundStep
              activeStep={activeStep}
              stepNumber={idx + 1}
              title={step.title}
              text={step.text}
            />
          </>
        ))}
      </Card>
    </>
  );
};

export default SecondaryCard;
