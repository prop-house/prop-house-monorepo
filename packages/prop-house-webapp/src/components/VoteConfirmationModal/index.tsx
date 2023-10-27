import React, { Dispatch, SetStateAction } from 'react';
import classes from './VoteConfirmationModal.module.css';
import Button, { ButtonColor } from '../Button';
import { useAppSelector } from '../../hooks';
import { countVotesRemainingForTimedRound } from '../../utils/countVotesRemainingForTimedRound';
import { VoteAllotment } from '../../types/VoteAllotment';
import sortVoteAllotmentsByVotes from '../../utils/sortVoteAllotmentsByVotes';
import Modal, { ModalProps } from '../Modal';
import { Round, usePropHouse } from '@prophouse/sdk-react';
import LoadingIndicator from '../LoadingIndicator';
import { NounImage } from '../../utils/getNounImage';
import { useDispatch } from 'react-redux';
import { setOnChainActiveProposals } from '../../state/slices/propHouse';
import { clearVoteAllotments } from '../../state/slices/voting';

const VoteConfirmationModal: React.FC<{
  round: Round;
  setShowVoteConfirmationModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowVoteConfirmationModal, round } = props;

  const propHouse = usePropHouse();
  const dispatch = useDispatch();
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const votesByUserInActiveRound = useAppSelector(state => state.voting.votesByUserInActiveRound);

  const numPropsVotedFor = voteAllotments.length;
  const votesLeft = countVotesRemainingForTimedRound(
    votingPower,
    votesByUserInActiveRound,
    voteAllotments,
  );
  const totalVotesBeingSubmitted = voteAllotments.reduce(
    (total, prop) => (total = total + prop.votes),
    0,
  );
  const sortedVoteAllottments = sortVoteAllotmentsByVotes(voteAllotments);

  const handleSubmitVote = async () => {
    if (!proposals) return;
    try {
      setCurrentModalData(loadingData);
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

      setCurrentModalData(successData);

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
    } catch (e: any) {
      console.log(e);
      setCurrentModalData(errorData(e.message));
    }
  };

  const confirmVoteData: ModalProps = {
    title: `Cast ${totalVotesBeingSubmitted} ${totalVotesBeingSubmitted === 1 ? 'vote' : 'votes'}`,
    subtitle: `You'll have ${votesLeft} votes remaining`,
    body: (
      <div className={classes.propsContainer}>
        <div className={classes.props}>
          {sortedVoteAllottments.map((prop: VoteAllotment) => (
            <div key={prop.proposalId} className={classes.propCopy}>
              <p className={classes.voteCount}>{prop.votes}</p>
              <hr className={classes.line} />
              <p className={classes.propTitle}>{prop.proposalTitle}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    button: (
      <Button
        text={'Sign and submit'}
        bgColor={ButtonColor.Purple}
        onClick={() => handleSubmitVote()}
      />
    ),
    setShowModal: setShowVoteConfirmationModal,
  };

  const loadingData: ModalProps = {
    title: 'Loading',
    subtitle: 'Please wait',
    body: <LoadingIndicator />,
    setShowModal: setShowVoteConfirmationModal,
  };

  const errorData = (errorMessage?: string): ModalProps => {
    return {
      title: 'Error',
      subtitle: errorMessage ? errorMessage : 'Something went wrong',
      image: NounImage.Banana,
      setShowModal: setShowVoteConfirmationModal,
    };
  };

  const successData: ModalProps = {
    title: 'Very Nounish',
    subtitle: `You successfully voted for ${numPropsVotedFor} ${
      numPropsVotedFor === 1 ? 'prop' : 'props'
    }`,
    image: NounImage.Glasses,
    button: (
      <Button
        text={'Close'}
        bgColor={ButtonColor.White}
        onClick={() => setShowVoteConfirmationModal(false)}
      />
    ),
    setShowModal: setShowVoteConfirmationModal,
  };

  const [currentModalData, setCurrentModalData] = React.useState<ModalProps>(confirmVoteData);

  return <Modal modalProps={currentModalData} />;
};

export default VoteConfirmationModal;
