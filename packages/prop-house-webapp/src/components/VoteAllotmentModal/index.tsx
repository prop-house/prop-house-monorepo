import React, { Dispatch, SetStateAction } from 'react';
import classes from './VoteAllotmentModal.module.css';
import { useAppSelector } from '../../hooks';
import { FaLink } from 'react-icons/fa';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import sortVoteAllotmentsByVotes from '../../utils/sortVoteAllotmentsByVotes';

const VoteAllotmentModal: React.FC<{
  propId: number;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { propId, setShowModal } = props;

  const round = useAppSelector(state => state.propHouse.activeRound);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);

  const voteAllotmentData = sortVoteAllotmentsByVotes(voteAllotments).map((v, idx) => (
    <div key={idx} className={classes.votesRow}>
      <div className={classes.voteRowTitle}>
        <span className={classes.votesAndTitle}>
          <span className={classes.propVotes}>
            {v.votes} {v.votes === 1 ? 'vote' : 'votes'} for{' '}
          </span>
          <span className={classes.propTitle}>{v.proposalTitle}</span>
        </span>

        {round && (
          <button
            disabled={v.proposalId === propId}
            className={classes.propLink}
            onClick={e => {
              // todo: fix this
              // if (cmdPlusClicked(e)) {
              //   openInNewTab(`${buildRoundPath(community, round)}/${v.proposalId}`);
              //   setShowModal(false);
              //   return;
              // }
              // const p = proposals && proposals.find(p => p.id === v.proposalId);
              // p && dispatch(setOnchainActiveProposal(p));
              // setShowModal(false);
            }}
          >
            <FaLink />
          </button>
        )}
      </div>
    </div>
  ));

  const noVotesAllotted = voteAllotmentData.length <= 0;

  return (
    <Modal
      modalProps={{
        title: noVotesAllotted ? 'No votes allotted' : 'Votes allotted',
        subtitle: noVotesAllotted ? '' : 'You have allotted votes for the following proposals',
        body: !noVotesAllotted && <div className={classes.votesContainer}>{voteAllotmentData}</div>,
        image: noVotesAllotted ? NounImage.Blackhole : null,
        setShowModal: setShowModal,
      }}
    />
  );
};

export default VoteAllotmentModal;
