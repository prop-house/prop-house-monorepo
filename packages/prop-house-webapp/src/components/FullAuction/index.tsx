import classes from './FullAuction.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import AuctionHeader from '../AuctionHeader';
import ProposalCards from '../ProposalCards';
import AllProposalsCTA from '../AllProposalsCTA';
import { Row, Col } from 'react-bootstrap';
import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { getNounerVotes, getNounishVotes } from 'prop-house-nounish-contracts';
import { useEthers } from '@usedapp/core';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import useWeb3Modal from '../../hooks/useWeb3Modal';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../hooks';
import { setDelegatedVotes, sortProposals } from '../../state/slices/propHouse';
import extractAllVotes from '../../utils/extractAllVotes';
import {
  auctionEmptyContent,
  auctionNotStartedContent,
  connectedCopy,
  disconnectedCopy,
} from './content';

const FullAuction: React.FC<{
  auction: StoredAuction;
  showAllProposals: boolean;
}> = (props) => {
  const { auction, showAllProposals } = props;

  const [earliestFirst, setEarliestFirst] = useState(false);
  const { account, library } = useEthers();
  const connect = useWeb3Modal();
  const dispatch = useDispatch();
  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegatedVotes
  );
  const userVotes = () => {
    if (!account || !proposals) return 0;
    return extractAllVotes(proposals, account).length;
  };

  // fetch votes
  useEffect(() => {
    if (!account || !library) return;

    const fetchVotes = async (getVotes: Promise<number>): Promise<boolean> => {
      const votes = await getVotes;
      if (Number(votes) === 0) return false;
      dispatch(setDelegatedVotes(votes));
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

  const handleSort = () => {
    setEarliestFirst((prev) => {
      dispatch(sortProposals(!prev));
      return !prev;
    });
  };

  return (
    <>
      {showAllProposals &&
        auctionStatus(auction) === AuctionStatus.AuctionVoting &&
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
      <AuctionHeader
        auction={auction}
        clickable={false}
        classNames={classes.auctionHeader}
        totalVotes={delegatedVotes}
        votesLeft={delegatedVotes && delegatedVotes - userVotes()}
      />
      <Card
        bgColor={CardBgColor.LightPurple}
        borderRadius={CardBorderRadius.thirty}
        classNames={clsx(classes.customCardHeader, classes.fixedHeight)}
      >
        <Row>
          <Col xs={6} md={2}>
            <div className={classes.proposalTitle}>
              Proposals{' '}
              <span onClick={handleSort}>{earliestFirst ? '↓' : '↑'}</span>
            </div>
          </Col>
          <Col xs={6} md={10}>
            <div className={classes.divider} />
          </Col>
        </Row>

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
