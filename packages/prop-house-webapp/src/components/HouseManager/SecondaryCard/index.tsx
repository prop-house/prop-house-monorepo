import classes from './SecondaryCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import CreateRoundStep from '../../CreateRoundStep';
import { useAppSelector } from '../../../hooks';
import clsx from 'clsx';

const SecondaryCard: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);

  const steps = [
    {
      title: 'Select the house',
      text: 'Set the name and description',
    },
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
      text: 'Define number of winners and awards',
    },
    {
      title: 'Round timing',
      text: 'Set how long the round should be',
    },
    {
      title: 'Create the round 🎉',
      text: 'Review the round settings and create it',
    },
  ];

  // If the activeStep is greater than 2, show steps 3-5. Otherwise, show the subset of steps starting from the activeStep.
  const displayedSteps = activeStep > 2 ? steps.slice(2, 5) : steps.slice(activeStep - 1);
  // Set the start index of the displayed steps based on the activeStep.
  // If the activeStep is greater than 2, start at step 3. Otherwise, start at the activeStep.
  const start = activeStep > 2 ? 2 : activeStep - 1;

  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={clsx(classes.secondaryCard, classes.hideOnMobile)}
      >
        {steps.map((step, idx) => (
          <CreateRoundStep
            activeStep={activeStep}
            stepNumber={idx + 1}
            title={step.title}
            text={step.text}
            key={idx}
          />
        ))}
      </Card>

      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={clsx(classes.secondaryCard, classes.fullCard)}
      >
        {displayedSteps.map((step, idx) => (
          <CreateRoundStep
            activeStep={activeStep}
            stepNumber={start + idx + 1}
            title={step.title}
            text={step.text}
            key={idx}
          />
        ))}
      </Card>
    </>
  );
};

export default SecondaryCard;
