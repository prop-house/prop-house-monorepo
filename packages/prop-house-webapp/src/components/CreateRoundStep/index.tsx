import classes from './CreateRoundStep.module.css';
import Text from '../HouseManager/Text';
import clsx from 'clsx';

const CreateRoundStep: React.FC<{
  activeStep: number;
  stepNumber: number;
  title: string;
  text: string;
}> = props => {
  const { activeStep, stepNumber, title, text } = props;

  const getStylesForStep = () =>
    activeStep > stepNumber
      ? classes.completedStep
      : activeStep === stepNumber
      ? classes.currentStep
      : classes.futureStep;

  return (
    <>
      <div className={clsx(classes.step, getStylesForStep())}>
        {/* TODO - fix vertical dotted line logic, doesn't grow as text wraps to 2nd line (currently fixed height) */}
        <span className={classes.number}>{stepNumber}</span>

        <div className={classes.textContainer}>
          <Text type="title">{title}</Text>
          <Text type="body">{text}</Text>
        </div>
      </div>
    </>
  );
};

export default CreateRoundStep;
