import {
  SignatureState,
  StoredAuction,
  StoredProposalWithVotes,
  Vote,
} from '@nouns/prop-house-wrapper/dist/builders';
import classes from './RoundContent.module.css';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import { aggVoteWeightForProps } from '../../utils/aggVoteWeight';
import { setActiveProposals } from '../../state/slices/propHouse';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import { getNumVotes } from 'prop-house-communities';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import SuccessModal from '../SuccessModal';
import ErrorModal from '../ErrorModal';
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
import SearchBar from '../SeachBar';

const RoundContent: React.FC<{
  auction: StoredAuction;
  proposals: StoredProposalWithVotes[];
}> = props => {
  const { auction, proposals } = props;
  const { account, library } = useEthers();

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [signerIsContract, setSignerIsContract] = useState(false);
  const [numPropsVotedFor, setNumPropsVotedFor] = useState(0);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState({
    title: '',
    message: '',
    image: '',
  });

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const winningIds = getWinningIds(proposals, auction);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch proposals
  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));

      // default sorting method is random, unless the auction is over, in which case its by votes
      dispatchSortProposals(
        dispatch,
        auctionStatus(auction) === AuctionStatus.AuctionEnded ||
          auctionStatus(auction) === AuctionStatus.AuctionVoting
          ? SortType.VoteCount
          : SortType.Random,
        false,
      );
    };
    fetchAuctionProposals();
    return () => {
      dispatch(setActiveProposals([]));
    };
  }, [auction.id, dispatch, account, auction]);

  // fetch voting power for user
  useEffect(() => {
    if (!account || !library || !community) return;

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
  }, [account, library, dispatch, community, auction.balanceBlockTag]);

  // update submitted votes on proposal changes
  useEffect(() => {
    if (proposals && account)
      dispatch(setNumSubmittedVotes(aggVoteWeightForProps(proposals, account)));
  }, [proposals, account, dispatch]);

  const _signerIsContract = async () => {
    if (!library || !account) {
      return false;
    }
    const code = await library?.getCode(account);
    const isContract = code !== '0x';
    setSignerIsContract(isContract);
    return isContract;
  };

  const handleSubmitVote = async () => {
    if (!library) return;
    try {
      const blockHeight = await library.getBlockNumber();
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

      setNumPropsVotedFor(voteAllotments.length);
      setShowSuccessModal(true);
      refreshActiveProposals(client.current, auction.id, dispatch);
      dispatch(clearVoteAllotments());
      setShowVoteConfirmationModal(false);
    } catch (e) {
      setErrorModalMessage({
        title: 'Failed to submit votes',
        message: 'Please go back and try again.',
        image: 'banana.png',
      });
      setShowErrorModal(true);
    }
  };

  const [input, setInput] = useState('');

  const handleProposalSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const [filteredProps, setFilteredProps] = useState<StoredProposalWithVotes[]>([]);

  useEffect(() => {
    if (!proposals || proposals.length === 0) return;
    if (input.length === 0) setFilteredProps(proposals);

    setFilteredProps(
      proposals.filter(c => {
        const query = input.toLowerCase();

        return (
          c.title.toLowerCase().indexOf(query) >= 0 ||
          c.tldr.toString().toLowerCase().indexOf(query) >= 0 ||
          c.what.toString().toLowerCase().indexOf(query) >= 0
        );
      }),
    );
  }, [proposals, input]);

  return (
    <>
      {showVoteConfirmationModal && (
        <VoteConfirmationModal
          showNewModal={showVoteConfirmationModal}
          setShowNewModal={setShowVoteConfirmationModal}
          votingEndTime={auction.votingEndTime}
          submitVote={handleSubmitVote}
          secondBtn
        />
      )}

      {showSuccessModal && (
        <SuccessModal
          showSuccessModal={showSuccessModal}
          setShowSuccessModal={setShowSuccessModal}
          numPropsVotedFor={numPropsVotedFor}
          signerIsContract={signerIsContract}
        />
      )}

      {showErrorModal && (
        <ErrorModal
          showErrorModal={showErrorModal}
          setShowErrorModal={setShowErrorModal}
          title={errorModalMessage.title}
          message={errorModalMessage.message}
          image={errorModalMessage.image}
        />
      )}

      {auctionStatus(auction) === AuctionStatus.AuctionNotStarted ? (
        <ErrorMessageCard message="Funding round starting soon" date={auction.startTime} />
      ) : (
        <>
          {community && (
            <Row className={classes.propCardsRow}>
              <Col xl={8} className={classes.propCardsCol}>
                {filteredProps && filteredProps.length > 0 ? (
                  filteredProps.map((proposal, index) => {
                    return (
                      <Col key={index}>
                        <ProposalCard
                          proposal={proposal}
                          auctionStatus={auctionStatus(auction)}
                          cardStatus={cardStatus(votingPower > 0, auction)}
                          winner={winningIds && isWinner(winningIds, proposal.id)}
                        />
                      </Col>
                    );
                  })
                ) : input === '' ? (
                  <ErrorMessageCard message={t('submittedProps')} />
                ) : (
                  <ErrorMessageCard message={'No proposals found'} />
                )}
              </Col>

              <div className="proposalSearchBarMobile">
                <SearchBar
                  input={input}
                  handleSeachInputChange={handleProposalSearch}
                  placeholder="Search for proposals"
                  disabled={proposals && proposals.length === 0}
                />
              </div>

              <RoundModules
                auction={auction}
                community={community}
                setShowVotingModal={setShowVoteConfirmationModal}
                input={input}
                handleProposalSearch={handleProposalSearch}
              />
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default RoundContent;
