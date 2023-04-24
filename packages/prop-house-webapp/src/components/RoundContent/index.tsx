import { SignatureState, Vote } from '@nouns/prop-house-wrapper/dist/builders';
import classes from './RoundContent.module.css';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
// import { getVotingPower } from 'prop-house-communities';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessVotingModal from '../SuccessVotingModal';
import ErrorVotingModal from '../ErrorVotingModal';
import {
  clearVoteAllotments,
  setVotesByUserInActiveRound,
  setVotingPower,
} from '../../state/slices/voting';
import { Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import RoundModules from '../RoundModules';
import { useAccount, useSigner, useProvider } from 'wagmi';
import { fetchBlockNumber } from '@wagmi/core';
import ProposalCard from '../ProposalCard';
import { cardStatus } from '../../utils/cardStatus';
import isWinner from '../../utils/isWinner';
import getWinningIds from '../../utils/getWinningIds';
import { InfRoundFilterType } from '../../state/slices/propHouse';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { Proposal, Round, RoundState, usePropHouse } from '@prophouse/sdk-react';

const RoundContent: React.FC<{
  round: Round;
  proposals: Proposal[];
}> = props => {
  const { round, proposals } = props;
  const { address: account } = useAccount();

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessVotingModal, setShowSuccessVotingModal] = useState(false);
  const [signerIsContract, setSignerIsContract] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [showErrorVotingModal, setShowErrorVotingModal] = useState(false);

  const propHouse = usePropHouse();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const infRoundFilter = useAppSelector(state => state.propHouse.infRoundFilterType);

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const modalActive = useAppSelector(state => state.propHouse.modalActive);

  const { data: signer } = useSigner();
  const provider = useProvider();
  const staleProp = isInfAuction(round) && infRoundFilter === InfRoundFilterType.Stale;
  const warningMessage = isTimedAuction(round)
    ? t('submittedProposals')
    : infRoundFilter === InfRoundFilterType.Active
    ? 'Active proposals will show up here.'
    : infRoundFilter === InfRoundFilterType.Winners
    ? 'Proposals that meet quorum will show up here.'
    : 'Proposals that did not meet quorum before voting period ended will show up here.';

  // Fetch voting power for user
  useEffect(() => {
    if (!account || !signer || !community) return;

    const fetchVotes = async () => {
      try {
        const { votingStrategies } = await propHouse.query.getRoundVotingStrategies(round.address);
        const votes = await propHouse.voting.getTotalVotingPower(
          account,
          round.config.proposalPeriodEndTimestamp,
          votingStrategies,
        );
        dispatch(setVotingPower(votes.toNumber())); // TODO: Needs to be BN or string
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, signer, dispatch, community, propHouse.query, propHouse.voting, round.address, round.config.proposalPeriodEndTimestamp]);

  // update submitted votes on proposal changes
  // TODO: Implement
  // useEffect(() => {
  //   const votes = proposals.flatMap(p => (p.votes ? p.votes : []));
  //   if (proposals && account && votes.length > 0)
  //     dispatch(setVotesByUserInActiveRound(votes.filter(v => v.address === account)));
  // }, [proposals, account, dispatch]);

  const _signerIsContract = async () => {
    if (!provider || !account) {
      return false;
    }
    const code = await provider?.getCode(account);
    const isContract = code !== '0x';
    setSignerIsContract(isContract);
    return isContract;
  };

  const handleSubmitVote = async () => {
    try {
      const blockHeight = await fetchBlockNumber();

      // TODO: Implement
      // const votes = voteAllotments
      //   .map(
      //     a =>
      //       new Vote(
      //         1,
      //         a.proposalId,
      //         a.votes,
      //         community!.contractAddress,
      //         SignatureState.PENDING_VALIDATION,
      //         blockHeight,
      //       ),
      //   )
      //   .filter(v => v.weight > 0);
      // const isContract = await _signerIsContract();

      // await client.current.logVotes(votes, isContract);

      setShowErrorVotingModal(false);
      setNumPropsVotedFor(voteAllotments.length);
      setShowSuccessVotingModal(true);
      refreshActiveProposals(propHouse, round, dispatch);
      dispatch(clearVoteAllotments());
      setShowVoteConfirmationModal(false);
    } catch (e) {
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
          signerIsContract={signerIsContract}
        />
      )}

      {showErrorVotingModal && (
        <ErrorVotingModal setShowErrorVotingModal={setShowErrorVotingModal} />
      )}

      {round.state === RoundState.NOT_STARTED ? (
        <ErrorMessageCard message={t('fundingRoundStartingSoon')} date={new Date(Number(round.config.proposalPeriodStartTimestamp) * 1000)} />
      ) : (
        <>
          {community && !modalActive && (
            <Row className={classes.propCardsRow}>
              <Col xl={8} className={classes.propCardsCol}>
                {proposals &&
                  (proposals.length === 0 ? (
                    <ErrorMessageCard message={warningMessage} />
                  ) : (
                    <>
                      {proposals.map((prop, index) => (
                        <Col key={index}>
                          <ProposalCard
                            proposal={prop}
                            roundState={round.state}
                            cardStatus={cardStatus(votingPower > 0, round)}
                            isWinner={isWinner(getWinningIds(proposals, round), prop.id)}
                            stale={staleProp}
                          />
                        </Col>
                      ))}
                    </>
                  ))}
              </Col>
              <RoundModules
                round={round}
                proposals={proposals}
                community={community}
                setShowVotingModal={setShowVoteConfirmationModal}
              />
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default RoundContent;
