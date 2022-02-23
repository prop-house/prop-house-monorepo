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
import { useQuery } from '@apollo/client';
import { delegatedVotesToAddress } from '../../wrappers/subgraph';
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

  const [isNouner, setIsNouner] = useState(false);
  const { account } = useEthers();
  const connect = useWeb3Modal();
  const dispatch = useDispatch();
  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );

  const { loading, error, data } = useQuery(
    delegatedVotesToAddress(account ? account : '')
  );

  useEffect(() => {
    if (!account || loading || error || !data.delegates[0]) return;
    const delegatedVotes = data.delegates[0].delegatedVotesRaw;
    setIsNouner(delegatedVotes > 0);
    dispatch(setDelegatedVotes(delegatedVotes));
  }, [loading, error, data, account, dispatch]);

  // alert to get nouners to connect when auctions in voting stage
  const disconnectedCopy = (
    <div className={classes.alertWrapper}>
      <p>The voting period is now open. Noun owners can vote for proposals.</p>
      <Button
        text="Connect wallet"
        bgColor={ButtonColor.Pink}
        onClick={connect}
      />
    </div>
  );

  // alert verifying that connected wallet is a nouner
  const connectedCopy = (
    <div className={classes.connectedCopy}>
      You are a Noun owner! Cast your vote for the proposal you believe should
      receive funding.
    </div>
  );

  return (
    <>
      {auctionStatus(auction) === AuctionStatus.AuctionVoting &&
        (isNouner === true || account === undefined) && (
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.twenty}
          >
            <div>{isNouner ? connectedCopy : disconnectedCopy}</div>
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
        {isNouner && proposals && account && delegatedVotes && (
          <VotesLeft
            numVotesLeft={
              delegatedVotes - extractAllVotes(proposals, account).length
            }
          />
        )}
        <ProposalCards auction={auction} showAllProposals={showAllProposals} />
        {!showAllProposals && (
          <AllProposalsCTA
            numProposals={auction.proposals.length}
            auctionId={auction.id}
          />
        )}
      </Card>
    </>
  );
};

export default FullAuction;
