import classes from './RoundContent.module.css';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessVotingModal from '../SuccessVotingModal';
import ErrorVotingModal from '../ErrorVotingModal';
import { Row, Col } from 'react-bootstrap';
import { Proposal, Round, RoundType, Timed, usePropHouse } from '@prophouse/sdk-react';
import TimedRoundProposalCard from '../TimedRoundProposalCard';
import TimedRoundModules from '../TimedRoundModules';
import InfRoundModules from '../InfRoundModules';
import { clearVoteAllotments } from '../../state/slices/voting';
import Modal from '../Modal';
import LoadingIndicator from '../LoadingIndicator';
import { setOnChainActiveProposals } from '../../state/slices/propHouse';

const RoundContent: React.FC<{
  round: Round;
  proposals: Proposal[];
}> = props => {
  const { round, proposals } = props;

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessVotingModal, setShowSuccessVotingModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [showErrorVotingModal, setShowErrorVotingModal] = useState(false);

  const dispatch = useDispatch();
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);

  const propHouse = usePropHouse();

  const handleSubmitVote = async () => {
    try {
      setShowLoadingModal(true);
      const votes = voteAllotments
        .filter(a => a.votes > 0)
        .map(a => ({ proposalId: a.proposalId, votingPower: a.votes }));

      const result = await propHouse.round.timed.voteViaSignature({
        round: round.address,
        votes,
      });

      if (!result?.transaction_hash) {
        throw new Error(`Vote submission failed: ${result}`);
      }
      setShowLoadingModal(false);
      setNumPropsVotedFor(voteAllotments.length);
      setShowSuccessVotingModal(true);

      // refresh props with new votes
      const updatedProps = proposals.map(prop => {
        const voteForProp = votes.find(v => v.proposalId === prop.id);
        let newProp = { ...prop };
        if (voteForProp)
          newProp.votingPower = `${Number(newProp.votingPower) + voteForProp.votingPower}`;
        return newProp;
      });
      dispatch(setOnChainActiveProposals(updatedProps));

      dispatch(clearVoteAllotments());
      setShowVoteConfirmationModal(false);
    } catch (e) {
      console.log(e);
      setShowLoadingModal(false);
      setShowErrorVotingModal(true);
    }
  };

  return (
    <>
      {showVoteConfirmationModal && (
        <VoteConfirmationModal
          setShowVoteConfirmationModal={setShowVoteConfirmationModal}
          submitVote={handleSubmitVote}
        />
      )}

      {showSuccessVotingModal && (
        <SuccessVotingModal
          setShowSuccessVotingModal={setShowSuccessVotingModal}
          numPropsVotedFor={numPropsVotedFor}
        />
      )}

      {showErrorVotingModal && (
        <ErrorVotingModal setShowErrorVotingModal={setShowErrorVotingModal} />
      )}

      {showLoadingModal && (
        <Modal
          title={'Submitting Votes'}
          subtitle={`Signing.. Sending...`}
          body={<LoadingIndicator />}
          setShowModal={setShowLoadingModal}
        />
      )}

      <Row className={classes.propCardsRow}>
        <Col xl={8} className={classes.propCardsCol}>
          {round.state === Timed.RoundState.UNKNOWN ? (
            <ErrorMessageCard message={'Error determining the state of the round'} />
          ) : round.state === Timed.RoundState.CANCELLED ? (
            <ErrorMessageCard message={'Round was cancelled'} />
          ) : round.state === Timed.RoundState.NOT_STARTED ? (
            <ErrorMessageCard
              message={'Round starting soon'}
              date={new Date(round.config.proposalPeriodStartTimestamp * 1000)}
            />
          ) : proposals.length === 0 ? (
            <ErrorMessageCard message={'Submitted proposals will show up here'} />
          ) : (
            <>
              {proposals.map((prop, index) => (
                <Col key={index}>
                  <TimedRoundProposalCard
                    proposal={prop}
                    roundState={round.state}
                    isWinner={prop.isWinner}
                  />
                </Col>
              ))}
            </>
          )}
        </Col>
        {round.type === RoundType.TIMED ? (
          <TimedRoundModules
            round={round}
            proposals={proposals}
            setShowVotingModal={setShowVoteConfirmationModal}
          />
        ) : (
          <InfRoundModules
            round={round}
            proposals={proposals}
            setShowVotingModal={setShowVoteConfirmationModal}
          />
        )}
      </Row>
    </>
  );
};

export default RoundContent;
