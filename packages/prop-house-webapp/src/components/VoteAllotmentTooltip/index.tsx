import classes from './VoteAllotmentTooltip.module.css';

import { FaList } from 'react-icons/fa';

import React, { Dispatch, SetStateAction } from 'react';

const VoteAllotmentTooltip: React.FC<{
  setShowVoteAllotmentModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowVoteAllotmentModal } = props;

  return (
    <>
      <div className="voteAllotmentModal">
        <div
          className={classes.allottedVotesTooltip}
          onClick={() => setShowVoteAllotmentModal(true)}
        >
          <FaList />
        </div>
      </div>
    </>
  );
};

export default VoteAllotmentTooltip;
