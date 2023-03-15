import {
  StoredAuctionBase,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import { Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { auctionStatus } from '../../utils/auctionStatus';
import { cardStatus } from '../../utils/cardStatus';
import getWinningIds from '../../utils/getWinningIds';
import isWinner from '../../utils/isWinner';
import ProposalCard from '../ProposalCard';

const TimedRoundProps: React.FC<{
  proposals: StoredProposalWithVotes[];
  auction: StoredAuctionBase;
}> = props => {
  const { proposals, auction } = props;

  const votingPower = useAppSelector(state => state.voting.votingPower);
  const winningIds = getWinningIds(proposals, auction);

  return (
    <>
      {proposals.map((prop, index) => (
        <Col key={index}>
          <ProposalCard
            proposal={prop}
            auctionStatus={auctionStatus(auction)}
            cardStatus={cardStatus(votingPower > 0, auction)}
            isWinner={isWinner(winningIds, prop.id)}
          />
        </Col>
      ))}
    </>
  );
};

export default TimedRoundProps;
