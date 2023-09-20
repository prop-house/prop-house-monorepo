import classes from '../AcceptingPropsModule/AcceptingPropsModule.module.css';
import RoundModuleCard from '../RoundModuleCard';
import { useAccount } from 'wagmi';
import { BsPersonFill } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Round } from '@prophouse/sdk-react';

const RoundModuleNotStarted: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsPersonFill color="" />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={'All accounts are welcome to propose.'} />
          </p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <MdHowToVote />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={'votingCopy'} />
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
