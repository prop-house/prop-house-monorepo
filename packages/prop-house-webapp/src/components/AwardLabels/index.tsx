import classes from './AwardLabels.module.css';
import { RoundAward } from '@prophouse/sdk-react';
import AwardLabel, { MoreAwardsLabel } from '../AwardLabel';
import { Dispatch, SetStateAction } from 'react';

const AwardLabels: React.FC<{
  awards: RoundAward[];
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { awards, setShowModal } = props;
  return (
    <div className={classes.awardLabelsContainer}>
      {awards.map((award, i) => {
        if (i <= 2) return <AwardLabel key={i} award={award} place={i + 1} />;
        return <></>;
      })}
      {awards.length > 3 && <MoreAwardsLabel setShowModal={setShowModal} />}
    </div>
  );
};

export default AwardLabels;
