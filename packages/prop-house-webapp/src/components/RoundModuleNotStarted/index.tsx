import classes from '../TimedRoundAcceptingPropsModule/TimedRoundAcceptingPropsModule.module.css';
import RoundModuleCard from '../RoundModuleCard';
import { BsPersonFill } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Round } from '@prophouse/sdk-react';
import ProposingStrategiesDisplay from '../ProposingStrategiesDisplay';
import VotingStrategiesDisplay from '../VotingStrategiesDisplay';

const RoundModuleNotStarted: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <ProposingStrategiesDisplay
            proposingStrategies={round.proposingStrategies}
            propThreshold={round.config.proposalThreshold}
          />
        </div>

        <div className={classes.listItem}>
          <VotingStrategiesDisplay votingStrategies={round.votingStrategies} />
        </div>
      </div>
    </>
  );

  return (
    <RoundModuleCard
      title={'Round participation'}
      subtitle={<>Who can play</>}
      content={content}
      type="not started"
    />
  );
};

export default RoundModuleNotStarted;
