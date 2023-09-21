import classes from './RoundContent.module.css';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessVotingModal from '../SuccessVotingModal';
import ErrorVotingModal from '../ErrorVotingModal';
import { Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useAccount, useBlockNumber } from 'wagmi';
import ProposalCard from '../TimedRoundProposalCard';
import { ProposalCardStatus, cardStatus } from '../../utils/cardStatus';
import isWinner from '../../utils/isWinner';
import getWinningIds from '../../utils/getWinningIds';
import { InfRoundFilterType } from '../../state/slices/propHouse';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { execStrategy } from '@prophouse/communities/dist/actions/execStrategy';
import { useEthersSigner } from '../../hooks/useEthersSigner';
import { submitVotes } from '../../utils/submitVotes';
import { signerIsContract } from '../../utils/signerIsContract';
import { useEthersProvider } from '../../hooks/useEthersProvider';
import { Proposal, Round, RoundState } from '@prophouse/sdk-react';
import dayjs from 'dayjs';
import TimedRoundProposalCard from '../TimedRoundProposalCard';
import TimedRoundModules from '../TimedRoundModules';

const RoundContent: React.FC<{
  round: Round;
  proposals: Proposal[];
}> = props => {
  const { round, proposals } = props;

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessVotingModal, setShowSuccessVotingModal] = useState(false);
  const [isContract, setIsContract] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [showErrorVotingModal, setShowErrorVotingModal] = useState(false);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const infRoundFilter = useAppSelector(state => state.propHouse.infRoundFilterType);

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const host = useAppSelector(state => state.configuration.backendHost);

  const client = useRef(new PropHouseWrapper(host));
  const signer = useEthersSigner();
  const provider = useEthersProvider();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  return (
    <>
      {/* {showVoteConfirmationModal && (
        <VoteConfirmationModal
          setShowVoteConfirmationModal={setShowVoteConfirmationModal}
          submitVote={handleSubmitVote}
        />
      )} */}

      {showSuccessVotingModal && (
        <SuccessVotingModal
          setShowSuccessVotingModal={setShowSuccessVotingModal}
          numPropsVotedFor={numPropsVotedFor}
          signerIsContract={isContract}
        />
      )}

      {showErrorVotingModal && (
        <ErrorVotingModal setShowErrorVotingModal={setShowErrorVotingModal} />
      )}

      <Row className={classes.propCardsRow}>
        <Col xl={8} className={classes.propCardsCol}>
          {round.state < RoundState.IN_PROPOSING_PERIOD ? (
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
        <TimedRoundModules
          round={round}
          proposals={proposals}
          setShowVotingModal={setShowVoteConfirmationModal}
        />
      </Row>
    </>
  );
};

export default RoundContent;
