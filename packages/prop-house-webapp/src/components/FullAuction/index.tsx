import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import { Row } from 'react-bootstrap';
import { StoredAuction, Vote } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { useEffect, useState, useRef } from 'react';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { VoteAllotment, updateVoteAllotment } from '../../utils/voteAllotment';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { refreshActiveProposals } from '../../utils/refreshActiveProposal';
import Modal, { ModalData } from '../Modal';
import { aggVoteWeightForProps } from '../../utils/aggVoteWeight';
import {
  setDelegatedVotes,
  setActiveProposals,
} from '../../state/slices/propHouse';
import { dispatchSortProposals } from '../../utils/sortingProposals';
import {
  auctionEmptyContent,
  auctionNotStartedContent,
  connectedCopy,
  disconnectedCopy,
} from './content';
import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from 'react-icons/io5';
import { getNumVotes } from 'prop-house-communities';

const FullAuction: React.FC<{
  auction: StoredAuction;
  isFirstOrLastAuction: () => [boolean, boolean];
  handleAuctionChange: (next: boolean) => void;
}> = (props) => {
  const { auction, isFirstOrLastAuction, handleAuctionChange } = props;

  const { account, library } = useEthers();
  const [ascending, setAscending] = useState(false);
  const [voteAllotments, setVoteAllotments] = useState<VoteAllotment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ModalData>();

  const connect = useWeb3Modal();
  const dispatch = useDispatch();
  const community = useAppSelector((state) => state.propHouse.activeCommunity);
  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  // aggregate vote weight of already stored votes
  const userVotesWeight = () => {
    if (!account || !proposals) return 0;
    return aggVoteWeightForProps(proposals, account);
  };

  // total votes allotted (these are pre-submitted votes)
  const numAllotedVotes = voteAllotments.reduce(
    (counter, allotment) => counter + allotment.votes,
    0
  );

  // check vote allotment against vote user is allowed to use
  const canAllotVotes = () => {
    if (!delegatedVotes) return false;
    return numAllotedVotes < delegatedVotes - userVotesWeight();
  };

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch votes/delegated votes allowed for user to use
  useEffect(() => {
    if (!account || !library || !community) return;

    const fetchVotes = async () => {
      try {
        const votes = await getNumVotes(
          account,
          community.contractAddress,
          library
        );
        dispatch(setDelegatedVotes(votes));
      } catch (e) {
        console.log('error fetching votes: ', e);
      }
    };
    fetchVotes();
  }, [account, library, dispatch, community]);

  // fetch proposals
  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));
      // initial sort
      dispatchSortProposals(dispatch, auction, false);
    };
    fetchAuctionProposals();
  }, [auction.id, dispatch, account, auction]);

  // manage vote alloting
  const handleVoteAllotment = (proposalId: number, support: boolean) => {
    setVoteAllotments((prev) => {
      // if no votes have been allotted yet, add new
      if (prev.length === 0) return [{ proposalId, votes: 1 }];

      const preexistingVoteAllotment = prev.find(
        (allotment) => allotment.proposalId === proposalId
      );

      // if not already alloted to specific proposal,  add new allotment
      if (!preexistingVoteAllotment) return [...prev, { proposalId, votes: 1 }];

      // if already allotted to a specific proposal, add one vote to allotment
      const updated = prev.map((a) =>
        a.proposalId === preexistingVoteAllotment.proposalId
          ? updateVoteAllotment(a, support)
          : a
      );

      return updated;
    });
  };

  // handle voting
  const handleVote = async () => {
    if (!delegatedVotes || !community) return;

    const propCopy = voteAllotments
      .sort((a, b) => a.proposalId - b.proposalId)
      .filter((a) => a.votes > 0)
      .reduce(
        (agg, current) =>
          agg +
          `\n${current.votes} vote${current.votes > 1 ? 's' : ''} for prop ${
            current.proposalId
          }`,
        ''
      );

    setShowModal(true);

    try {
      setModalData({
        title: 'Voting',
        content: `Please sign the message to vote as follows:\n${propCopy}`,
        onDismiss: () => setShowModal(false),
      });

      const votes = voteAllotments
        .map(
          (a) => new Vote(1, a.proposalId, a.votes, community.contractAddress)
        )
        .filter((v) => v.weight > 0);
      await client.current.logVotes(votes);

      setModalData({
        title: 'Success',
        content: `You have successfully voted!\n${propCopy}`,
        onDismiss: () => setShowModal(false),
      });

      refreshActiveProposals(client.current, auction.id, dispatch);
      setVoteAllotments([]);
    } catch (e) {
      setModalData({
        title: 'Error',
        content: `Failed to submit votes.\n\nError message: ${e}`,
        onDismiss: () => setShowModal(false),
      });
    }
  };

  // sort button tapped
  const sortTapped = () => {
    setAscending((prev) => {
      dispatchSortProposals(dispatch, auction, !prev);
      return !prev;
    });
  };

  return (
    <>
      {showModal && modalData && <Modal data={modalData} />}
      {auctionStatus(auction) === AuctionStatus.AuctionVoting &&
        ((delegatedVotes && delegatedVotes > 0) || account === undefined) && (
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.twenty}
          >
            <div>
              {delegatedVotes && delegatedVotes > 0
                ? connectedCopy
                : disconnectedCopy(connect)}
            </div>
          </Card>
        )}
      {community && (
        <AuctionHeader
          auction={auction}
          clickable={false}
          classNames={classes.auctionHeader}
          totalVotes={delegatedVotes}
          voteBtnEnabled={
            delegatedVotes &&
            delegatedVotes - userVotesWeight() > 0 &&
            numAllotedVotes > 0
              ? true
              : false
          }
          votesLeft={delegatedVotes && delegatedVotes - userVotesWeight()}
          handleVote={handleVote}
          isFirstOrLastAuction={isFirstOrLastAuction}
          handleAuctionChange={handleAuctionChange}
        />
      )}

      <Card
        bgColor={CardBgColor.LightPurple}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.customCardHeader}
      >
        <Row>
          <div className={classes.dividerSection}>
            <div className={classes.proposalTitle}>{`Props ${
              proposals ? `(${proposals.length})` : ''
            }`}</div>
            <span onClick={sortTapped}>
              {ascending ? (
                <IoArrowUpCircleOutline size={'1.5rem'} />
              ) : (
                <IoArrowDownCircleOutline
                  size={'1.5rem'}
                  className={classes.icons}
                />
              )}
            </span>
            <div className={classes.divider} />
          </div>
        </Row>

        {auctionStatus(auction) === AuctionStatus.AuctionNotStarted ? (
          auctionNotStartedContent
        ) : auction.proposals.length === 0 ? (
          auctionEmptyContent
        ) : (
          <>
            <ProposalCards
              auction={auction}
              voteAllotments={voteAllotments}
              canAllotVotes={canAllotVotes}
              handleVoteAllotment={handleVoteAllotment}
            />
          </>
        )}
      </Card>
    </>
  );
};

export default FullAuction;
