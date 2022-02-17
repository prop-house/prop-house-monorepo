import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import { Row, Col } from 'react-bootstrap';
import ProposalCard, { ProposalCardStatus } from '../ProposalCard';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEffect, useRef } from 'react';
import auctionStatus, { AuctionStatus } from '../../utils/auctionStatus';
import { setActiveProposals } from '../../state/slices/propHouse';

const ProposalCards: React.FC<{
  auction: StoredAuction;
  showAllProposals: boolean;
}> = (props) => {
  const { auction, showAllProposals } = props;

  const dispatch = useAppDispatch();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const proposals = useAppSelector((state) => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(
    (state) => state.propHouse.delegateVotes
  );

  useEffect(() => {
    const fetchAuctionProposals = async () => {
      const proposals = await client.current.getAuctionProposals(auction.id);
      dispatch(setActiveProposals(proposals));
    };

    fetchAuctionProposals();
  }, [auction.id, dispatch]);

  return (
    <Row>
      {proposals &&
        proposals
          .slice(0, showAllProposals ? proposals.length : 6)
          .map((proposal, index) => {
            return (
              <Col key={index} xl={4}>
                <ProposalCard
                  proposal={proposal}
                  status={
                    auctionStatus(auction) === AuctionStatus.AuctionVoting &&
                    delegatedVotes &&
                    delegatedVotes > 0
                      ? ProposalCardStatus.CanVoteFor
                      : ProposalCardStatus.Default
                  }
                />
              </Col>
            );
          })}
    </Row>
  );
};
export default ProposalCards;
