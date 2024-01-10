import classes from './VotesVerificationModal.module.css';
import EthAddress from '../EthAddress';
import { Dispatch, SetStateAction } from 'react';
import Modal from '../Modal';
import { getBlockExplorerURL } from '../../utils/getBlockExplorerUrl';
import { Proposal, Vote } from '@prophouse/sdk-react';
import { useChainId } from 'wagmi';
import { parsedVotingPower } from '../../utils/parsedVotingPower';
import { useAppSelector } from '../../hooks';

const VotesVerificationModal: React.FC<{
  setDisplayVotesVerifModal: Dispatch<SetStateAction<boolean>>;
  proposal: Proposal;
  votes: Vote[];
}> = props => {
  const { proposal, setDisplayVotesVerifModal, votes } = props;
  const chainId = useChainId();
  const round = useAppSelector(state => state.propHouse.activeRound);
  const parsedProposalVotingPower = parsedVotingPower(proposal.votingPower, round!.address);

  const verifiedVotes = (
    <div className={classes.votesContainer}>
      {votes.map((vote, index) => {
        const votingPower = parsedVotingPower(vote.votingPower, round!.address);
        return (
          <div key={index} className={classes.votesRow}>
            <div className={classes.voteRowTitle}>
              <a
                href={getBlockExplorerURL(chainId, vote.txHash)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {`${votingPower.toString()} FOR  ${votingPower.eq(1) ? 'vote' : 'votes'}`}
              </a>
              &nbsp;by
              <EthAddress address={vote.voter} />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div onClick={e => e.stopPropagation()}>
      <Modal
        modalProps={{
          title: proposal.title,
          subtitle: `${parsedProposalVotingPower.toString()} ${
            parsedProposalVotingPower.eq(1) ? 'vote has been cast' : 'votes have been cast'
          }`,
          body: verifiedVotes,
          setShowModal: setDisplayVotesVerifModal,
        }}
      />
    </div>
  );
};

export default VotesVerificationModal;
