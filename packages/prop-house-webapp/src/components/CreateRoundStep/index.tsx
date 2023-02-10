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

  const getStylesForStep = () => {
    if (activeStep > stepNumber) return classes.completedStep;
    if (activeStep === stepNumber) return classes.currentStep;
    if (activeStep < stepNumber) return classes.futureStep;
  };

  return (
    <>
      <div className={clsx(classes.step, getStylesForStep())}>
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
