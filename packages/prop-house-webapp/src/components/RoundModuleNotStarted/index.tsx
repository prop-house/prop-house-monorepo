import classes from '../TimedRoundAcceptingPropsModule/TimedRoundAcceptingPropsModule.module.css';
import RoundModuleCard from '../RoundModuleCard';
import { BsPersonFill } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Round } from '@prophouse/sdk-react';
import useVotingCopy from '../../hooks/useVotingCopy';
import useProposingCopy from '../../hooks/useProposingCopy';

const RoundModuleNotStarted: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;
  const proposingCopy = useProposingCopy(round.votingStrategies); // todo: replace with round.proposingStrategies
  const votingCopy = useVotingCopy(round.votingStrategies);

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsPersonFill color="" />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={proposingCopy} />
          </p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <MdHowToVote />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={votingCopy} />
          </p>
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
