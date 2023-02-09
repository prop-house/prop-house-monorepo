import classes from './Footer.module.css';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import clsx from 'clsx';
import { useDispatch } from 'react-redux';
import { nextStep, prevStep } from '../../../state/slices/createRound';
import { useAppSelector } from '../../../hooks';

const Footer: React.FC = () => {
  const activeStep = useAppSelector(state => state.createRound.activeStep);

  const dispatch = useDispatch();
  const handleNext = () => {
    dispatch(nextStep());
  };
  const handlePrev = () => {
    dispatch(prevStep());
  };

  return (
    <>
      <Divider />

      <div className={clsx(classes.footer, activeStep === 1 && classes.justifyEnd)}>
        {activeStep > 1 && <Button text="Back" bgColor={ButtonColor.Black} onClick={handlePrev} />}
        {activeStep < 5 && <Button text="Next" bgColor={ButtonColor.Pink} onClick={handleNext} />}
      </div>
    </>
  );
};

export default Footer;
