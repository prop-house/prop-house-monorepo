import {
  SignatureState,
  StoredAuction,
  StoredProposalWithVotes,
  Vote,
} from '@nouns/prop-house-wrapper/dist/builders';
import classes from './RoundContent.module.css';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { aggValidatedVoteWeightForProps } from '../../utils/aggVoteWeight';
import { getNumVotes } from 'prop-house-communities';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessVotingModal from '../SuccessVotingModal';
import ErrorVotingModal from '../ErrorVotingModal';
import {
  clearVoteAllotments,
  setNumSubmittedVotes,
  setVotingPower,
} from '../../state/slices/voting';
import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';
import { cardStatus } from '../../utils/cardStatus';
import getWinningIds from '../../utils/getWinningIds';
import isWinner from '../../utils/isWinner';
import { useTranslation } from 'react-i18next';
import RoundModules from '../RoundModules';
import { InfuraProvider } from '@ethersproject/providers';
import { useAccount, useSigner, useProvider } from 'wagmi';
import { fetchBlockNumber } from '@wagmi/core';

const RoundContent: React.FC<{
  auction: StoredAuction;
  proposals: StoredProposalWithVotes[];
}> = props => {
  const { auction, proposals } = props;
  const { address: account } = useAccount();

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessVotingModal, setShowSuccessVotingModal] = useState(false);
  const [signerIsContract, setSignerIsContract] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [showErrorVotingModal, setShowErrorVotingModal] = useState(false);

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const modalActive = useAppSelector(state => state.propHouse.modalActive);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const winningIds = getWinningIds(proposals, auction);
  const { data: signer } = useSigner();
  const provider = useProvider();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  // fetch voting power for user
  useEffect(() => {
    if (!account || !signer || !community) return;

    const fetchVotes = async () => {
      try {
        const provider = new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID);
        const votes = await getNumVotes(
          account,
          community.contractAddress,
          provider,
          auction.balanceBlockTag,
        );
        dispatch(setVotingPower(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, signer, dispatch, community, auction.balanceBlockTag]);

  // update submitted votes on proposal changes
  useEffect(() => {
    if (proposals && account)
      dispatch(setNumSubmittedVotes(aggValidatedVoteWeightForProps(proposals, account)));
  }, [proposals, account, dispatch]);

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

      const votes = voteAllotments
        .map(
          a =>
            new Vote(
              1,
              a.proposalId,
              a.votes,
              community!.contractAddress,
              SignatureState.PENDING_VALIDATION,
              blockHeight,
            ),
        )
        .filter(v => v.weight > 0);
      const isContract = await _signerIsContract();

      await client.current.logVotes(votes, isContract);

      setShowErrorVotingModal(false);
      setNumPropsVotedFor(voteAllotments.length);
      setShowSuccessVotingModal(true);
      refreshActiveProposals(client.current, auction.id, dispatch);
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

      {auctionStatus(auction) === AuctionStatus.AuctionNotStarted ? (
        <ErrorMessageCard message={t('fundingRoundStartingSoon')} date={auction.startTime} />
      ) : (
        <>
          {community && !modalActive && (
            <Row className={classes.propCardsRow}>
              <Col xl={8} className={classes.propCardsCol}>
                {proposals &&
                  (proposals.length === 0 ? (
                    <ErrorMessageCard message={t('submittedProposals')} />
                  ) : (
                    proposals.map((proposal, index) => {
                      return (
                        <Col key={index}>
                          <ProposalCard
                            proposal={proposal}
                            auctionStatus={auctionStatus(auction)}
                            cardStatus={cardStatus(votingPower > 0, auction)}
                            isWinner={isWinner(winningIds, proposal.id)}
                          />
                        </Col>
                      );
                    })
                  ))}
              </Col>
              <RoundModules
                auction={auction}
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
