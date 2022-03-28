import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';
import { Row, Col } from 'react-bootstrap';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import auctionStatus from '../../utils/auctionStatus';
import { AuctionStatus } from '../../utils/auctionStatus';
import { getNounerVotes, getNounishVotes } from 'prop-house-nounish-contracts';
import { useEthers } from '@usedapp/core';

import { useEffect, useState } from 'react';
import Button, { ButtonColor } from '../Button';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { setDelegatedVotes } from '../../state/slices/propHouse';
import extractAllVotes from '../../utils/extractAllVotes';
import VotesLeft from '../VotesLeft';

const FullAuction: React.FC<{
  auction: StoredAuction;
  showAllProposals: boolean;
}> = (props) => {
  const { auction, showAllProposals } = props;

  const [eligibleToVote, setEligibleToVote] = useState(false);
  const { account, library } = useEthers();
  const connect = useWeb3Modal();
  const dispatch = useDispatch();
  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );

  useEffect(() => {
    if (!account || !library) return;

    const fetchVotes = async (getVotes: Promise<number>): Promise<boolean> => {
      const votes = await getVotes;
      if (votes === 0) return false;
      dispatch(setDelegatedVotes(votes));
      setEligibleToVote(true);
      return true;
    };

    const fetch = async () => {
      try {
        const nouner = await fetchVotes(getNounerVotes(account));
        if (!nouner) fetchVotes(getNounishVotes(account, library));
      } catch (e) {
        console.log('error getting votes');
      }
    };

    fetch();
  }, [account, library, dispatch]);

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
            <div className={classes.proposalTitle}>Proposals</div>
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
        <ProposalCards auction={auction} showAllProposals={showAllProposals} />

        {auctionStatus(auction) === AuctionStatus.AuctionNotStarted ||
        auction.proposals.length === 0 ? (
          <Card
            bgColor={CardBgColor.LightPurple}
            borderRadius={CardBorderRadius.twenty}
            classNames={classes.noPropCard}
          >
            <>
              Submission of proposals will be enabled once the funding round
              begins. Proposals will show up here
            </>
          </Card>
        ) : (
          !showAllProposals && (
            <AllProposalsCTA
              numProposals={auction.proposals.length}
              auctionId={auction.id}
            />
          )
        )}
      </Card>
    </>
  );
};

export default FullAuction;
