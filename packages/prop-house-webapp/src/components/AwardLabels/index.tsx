import classes from './AwardLabels.module.css';
import { RoundAward } from '@prophouse/sdk-react';
import AwardLabel, { MoreAwardsLabel } from '../AwardLabel';
import { Dispatch, SetStateAction } from 'react';

const AwardLabels: React.FC<{
  awards: RoundAward[];
  setShowModal: Dispatch<SetStateAction<boolean>>;
  size?: number;
}> = props => {
  const { awards, setShowModal, size } = props;
  return (
    <div className={classes.awardLabelsContainer}>
      {awards.map((award, i) => {
        if (i <= 2) return <AwardLabel key={i} award={award} place={i + 1} size={size} />;
        return null;
      })}
      {awards.length > 3 && <MoreAwardsLabel setShowModal={setShowModal} />}
    </div>
  );
};

export default AwardLabels;
