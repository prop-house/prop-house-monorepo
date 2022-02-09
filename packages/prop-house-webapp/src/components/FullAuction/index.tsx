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

const FullAuction: React.FC<{
  auction: StoredAuction;
  showAllProposals: boolean;
}> = (props) => {
  const { auction, showAllProposals } = props;

  const [isNouner, setIsNouner] = useState(undefined);
  const { account } = useEthers();
  const connect = useWeb3Modal();

  const { loading, error, data } = useQuery(
    delegatedVotesToAddress(account ? account : '')
  );

  useEffect(() => {
    // checks before verifying nouner status
    account &&
      !loading &&
      !error &&
      setIsNouner(data.delegates[0] && data.delegates[0].delegatedVotesRaw > 0);
  }, [loading, error, data, account]);

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
  const connectedCopy =
    'You are a Noun owner! Cast your vote for the proposal you believe should receive funding.';

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
        <ProposalCards
          proposals={
            showAllProposals ? auction.proposals : auction.proposals.slice(0, 6)
          }
        />
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
