import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';
import { Row, Col } from 'react-bootstrap';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import auctionStatus from '../../utils/auctionStatus';
import { AuctionStatus } from '../../utils/auctionStatus';
import { useEthers } from '@usedapp/core';
import { useEffect, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { setDelegatedVotes, sortProposals } from '../../state/slices/propHouse';
import extractAllVotes from '../../utils/extractAllVotes';
import VotesLeft from '../VotesLeft';
import { getNumVotes } from 'prop-house-communities';

const emptyCard = (copy: string) => (
  <Card
    bgColor={CardBgColor.LightPurple}
    borderRadius={CardBorderRadius.twenty}
    classNames={classes.noPropCard}
  >
    <>{copy}</>
  </Card>
);
const auctionNotStartedContent = emptyCard(
  'Submission of proposals will be enabled once the funding round begins. Proposals will show up here.'
);
const auctionEmptyContent = emptyCard('Submitted proposals will show up here.');

const FullAuction: React.FC<{
  auction: StoredAuction;
  showAllProposals: boolean;
}> = (props) => {
  const { auction, showAllProposals } = props;

  // use auction.contractAddress
  const contract_address = '0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03';

  const [eligibleToVote, setEligibleToVote] = useState(false);
  const [earliestFirst, setEarliestFirst] = useState(true);
  const { account, library } = useEthers();
  const connect = useWeb3Modal();
  const dispatch = useDispatch();
  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );

  useEffect(() => {
    if (!account || !library) return;

    const fetch = async () => {
      try {
        const votes = await getNumVotes(account, contract_address, library);
        dispatch(setDelegatedVotes(votes));
        setEligibleToVote(true);
      } catch (e) {
        console.log('Error fetching votes: ', e);
      }
    };

    fetch();
  }, [account, library, dispatch]);

  const handleSort = () => {
    setEarliestFirst((prev) => {
      dispatch(sortProposals(!prev));
      return !prev;
    });
  };

  // alert to get nouners to connect when auctions in voting stage
  const disconnectedCopy = (
    <div className={classes.alertWrapper}>
      <p>
        The voting period is now open. Members of the Nouns ecosystem can vote
        for proposals.
      </p>
      <Button
        text="Connect wallet"
        bgColor={ButtonColor.Pink}
        onClick={connect}
      />
    </div>
  );

  // alert verifying that connected wallet is a eligible to vote
  const connectedCopy = (
    <div className={classes.connectedCopy}>
      You are eligible to vote! Cast your vote for the proposal you believe
      should receive funding.
    </div>
  );

  return (
    <>
      {showAllProposals &&
        auctionStatus(auction) === AuctionStatus.AuctionVoting &&
        (eligibleToVote === true || account === undefined) && (
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.twenty}
          >
            <div>{eligibleToVote ? connectedCopy : disconnectedCopy}</div>
          </Card>
        )}
      <Card
        bgColor={CardBgColor.LightPurple}
        borderRadius={CardBorderRadius.thirty}
      >
        <AuctionHeader auction={auction} />
        <Row>
          <Col xs={4} md={2}>
            <div className={classes.proposalTitle}>
              Proposals{' '}
              <span onClick={handleSort}>{earliestFirst ? '↑' : '↓'}</span>
            </div>
          </Col>
          <Col xs={8} md={10}>
            <div className={classes.divider} />
          </Col>
        </Row>
        {auctionStatus(auction) === AuctionStatus.AuctionVoting &&
          eligibleToVote &&
          proposals &&
          account &&
          delegatedVotes && (
            <VotesLeft
              numVotesLeft={
                delegatedVotes - extractAllVotes(proposals, account).length
              }
            />
          )}

        {auctionStatus(auction) === AuctionStatus.AuctionNotStarted ? (
          auctionNotStartedContent
        ) : auction.proposals.length === 0 ? (
          auctionEmptyContent
        ) : (
          <>
            <ProposalCards
              auction={auction}
              showAllProposals={showAllProposals}
            />
            {!showAllProposals && (
              <AllProposalsCTA
                numProposals={auction.proposals.length}
                auctionId={auction.id}
              />
            )}
          </>
        )}
      </Card>
    </>
  );
};

export default FullAuction;
