import classes from './SetupRoundInfo.module.css';
import { FaLink as LinkIcon } from 'react-icons/fa';
import Divider from '../Divider';
import Input from '../Input';

const SetupRoundInfo = () => {
  return (
    <>
      <p className={classes.title}>Set up your first round</p>

      <Divider />

      <div className={classes.setupSection}>
        <Input title="Round title" placeholder="Hack-a-thon" />

        <span className={classes.nameAndButton}>
          <p className={classes.title}>Describe your round</p>

          <button>
            <LinkIcon size={10} />
            <span>Add Link</span>
          </button>
        </span>

        <textarea
          rows={5}
          placeholder="Describe the round. Think about the goals, timeline and how you will encourage builders to participate."
        />
      </div>
    </>
  );
};

export default SetupRoundInfo;
