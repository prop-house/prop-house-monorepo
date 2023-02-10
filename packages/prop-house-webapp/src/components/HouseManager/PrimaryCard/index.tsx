import classes from './PrimaryCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import NameTheRound from '../NameTheRound';
import WhoCanParticipate from '../WhoCanParticipate';
import SetTheAwards from '../SetTheAwards';
import { useAppSelector } from '../../../hooks';
import RoundTiming from '../RoundTiming';
import CreateTheRound from '../CreateTheRound';

const PrimaryCard: React.FC = () => {
  const activeStep = useAppSelector(state => state.createRound.activeStep);

  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.primaryCard}
      >
        {activeStep === 1 && <NameTheRound />}
        {activeStep === 2 && <WhoCanParticipate />}
        {activeStep === 3 && <SetTheAwards />}
        {activeStep === 4 && <RoundTiming />}
        {activeStep === 5 && <CreateTheRound />}
        {/* <CreateTheRound /> */}
      </Card>
    </>
  );
};

export default PrimaryCard;
