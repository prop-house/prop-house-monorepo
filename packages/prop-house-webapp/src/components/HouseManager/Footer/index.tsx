import classes from './Footer.module.css';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { setNextStep, setPrevStep } from '../../../state/slices/round';
import { useAppSelector } from '../../../hooks';

const Footer: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);
  const stepDisabledArray = useAppSelector(state => state.round.stepDisabledArray);

  const dispatch = useDispatch();

  const handleNext = () => {
    const isDisabled = stepDisabledArray[activeStep - 1];
    if (!isDisabled) {
      dispatch(setNextStep());
    }
  };

  const handlePrev = () => dispatch(setPrevStep());

  return (
    <>
      <Divider />

      <div className={clsx(classes.footer, activeStep === 1 && classes.justifyEnd)}>
        {activeStep > 1 && <Button text="Back" bgColor={ButtonColor.Black} onClick={handlePrev} />}

        {activeStep < 5 && (
          <Button
            text="Next"
            disabled={stepDisabledArray[activeStep - 1]}
            bgColor={ButtonColor.Pink}
            onClick={handleNext}
          />
        )}
        {activeStep === 5 && (
          <Button
            text="Create"
            disabled={stepDisabledArray[4]}
            bgColor={ButtonColor.Pink}
            onClick={() => {}}
          />
        )}
      </div>
    </>
  );
};

export default Footer;
