import classes from './VotesVerificationModal.module.css';
import { Proposal, usePropHouse, Vote } from '@prophouse/sdk-react';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { MdOutlinePendingActions } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';

const VotesVerificationModal: React.FC<{
  setDisplayVotesVerifModal: Dispatch<SetStateAction<boolean>>;
  proposal: Proposal;
}> = props => {
  const { proposal, setDisplayVotesVerifModal } = props;
  const { t } = useTranslation();

  const propHouse = usePropHouse();

  const [proposalVotes, setProposalVotes] = useState<Vote[]>([]);

  useEffect(() => {
    // TODO: Implement
    // propHouse.query.getVotesForProposal(proposal.round, proposal.id).then(votes => setProposalVotes(votes));
  }, [propHouse.query, proposal.id, proposal.round]);

  const verifiedVotes = (
    <div className={classes.votesContainer}>
      {proposalVotes
        .map((vote, index) => (
          <div key={index} className={classes.votesRow}>
            <div className={classes.voteRowTitle}>
              {`${vote.votingPower}  ${vote.votingPower === '1' ? t('vote') : t('votes')} ${t('by')}`}
              <EthAddress address={vote.voter} />
            </div>
{/* 
            {vote.signatureState === SignatureState.PENDING_VALIDATION && (
              <button className={classes.verifyVoteBtn} disabled={true}>
                {t('pending')} <MdOutlinePendingActions />
              </button>
            )} */}
          </div>
        ))}
    </div>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        title={proposal.title}
        subtitle={`${proposal.votingPower} ${proposal.votingPower === '1' ? t('vote') : t('votes')} ${t(
          'haveBeenCast',
        )}`}
        body={verifiedVotes}
        setShowModal={setDisplayVotesVerifModal}
      />
    </div>
  );
};

export default VotesVerificationModal;
