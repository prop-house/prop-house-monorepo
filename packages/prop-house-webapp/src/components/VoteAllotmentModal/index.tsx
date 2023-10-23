import React, { Dispatch, SetStateAction } from 'react';
import classes from './VoteAllotmentModal.module.css';
import { useAppSelector } from '../../hooks';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { openInNewTab } from '../../utils/openInNewTab';
import { FaLink } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setOnchainActiveProposal } from '../../state/slices/propHouse';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import sortVoteAllotmentsByVotes from '../../utils/sortVoteAllotmentsByVotes';

const VoteAllotmentModal: React.FC<{
  propId: number;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { propId, setShowModal } = props;
  const dispatch = useDispatch();
  const proposals = useAppSelector(state => state.propHouse.activeProposals);

  const community = useAppSelector(state => state.propHouse.activeCommunity);
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

        {round && community && (
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
      title={noVotesAllotted ? 'No votes allotted' : 'Votes allotted'}
      subtitle={noVotesAllotted ? '' : 'You have allotted votes for the following proposals'}
      body={!noVotesAllotted && <div className={classes.votesContainer}>{voteAllotmentData}</div>}
      image={noVotesAllotted && NounImage.Blackhole}
      setShowModal={setShowModal}
    />
  );
};

export default VoteAllotmentModal;
