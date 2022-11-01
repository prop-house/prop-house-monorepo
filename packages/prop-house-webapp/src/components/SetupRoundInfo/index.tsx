import classes from './SetupRoundInfo.module.css';
import { FaLink as LinkIcon } from 'react-icons/fa';
import Input from '../Input';
import { useState } from 'react';

const SetupRoundInfo = () => {
  const [roundTitle, setRoundTitle] = useState('');
  return (
    <>
      <div className={classes.setupSection}>
        <Input
          title="Round title"
          type="text"
          placeholder="Hack-a-thon"
          value={roundTitle}
          onChange={e => setRoundTitle(e.target.value)}
        />

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
