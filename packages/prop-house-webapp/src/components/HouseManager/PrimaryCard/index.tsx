import classes from './PrimaryCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import { useAppSelector } from '../../../hooks';
import NameTheRound from '../NameTheRound';
import WhoCanParticipate from '../WhoCanParticipate';
import SetTheAwards from '../SetTheAwards';
import RoundTiming from '../RoundTiming';
import CreateTheRound from '../CreateTheRound';

const PrimaryCard: React.FC = () => {
  const activeStep = useAppSelector(state => state.round.activeStep);

  const renderStep = () => {
    switch (activeStep) {
      case 1:
        return <NameTheRound />;
      case 2:
        return <WhoCanParticipate />;
      case 3:
        return <SetTheAwards />;
      case 4:
        return <RoundTiming />;
      case 5:
        return <CreateTheRound />;
      default:
        return null;
    }
  };

  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        classNames={classes.primaryCard}
        borderRadius={CardBorderRadius.thirty}
      >
        {renderStep()}
      </Card>
    </>
  );
};

export default PrimaryCard;
