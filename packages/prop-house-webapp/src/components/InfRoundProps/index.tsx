import classes from './InfRoundProps.module.css';
import {
  StoredAuctionBase,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import { Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { auctionStatus } from '../../utils/auctionStatus';
import { isInfAuction } from '../../utils/auctionType';
import { cardStatus } from '../../utils/cardStatus';
import getWinningIds from '../../utils/getWinningIds';
import { isActiveProp } from '../../utils/isActiveProp';
import isWinner from '../../utils/isWinner';
import ProposalCard from '../ProposalCard';
import { FaVoteYea } from 'react-icons/fa';
import { FaLock } from 'react-icons/fa';

const InfRoundProps: React.FC<{
  proposals: StoredProposalWithVotes[];
  auction: StoredAuctionBase;
}> = props => {
  const { proposals, auction } = props;

  const votingPower = useAppSelector(state => state.voting.votingPower);
  const winningIds = getWinningIds(proposals, auction);
  const activeProps = isInfAuction(auction) ? proposals.filter(p => isActiveProp(p, auction)) : [];
  const staleProps = isInfAuction(auction) ? proposals.filter(p => !isActiveProp(p, auction)) : [];

  return (
    <>
      <div className={classes.sectionHeader}>
        <FaVoteYea /> Active props
      </div>
      {activeProps.map((p, i) => (
        <Col key={i}>
          <ProposalCard
            proposal={p}
            auctionStatus={auctionStatus(auction)}
            cardStatus={cardStatus(votingPower > 0, auction)}
            isWinner={isWinner(winningIds, p.id)}
          />
        </Col>
      ))}
      <div className={classes.sectionHeader} style={{ opacity: 0.5 }}>
        <FaLock />
        Inactive
      </div>
      {staleProps.map((p, i) => (
        <Col key={i}>
          <ProposalCard
            proposal={p}
            auctionStatus={auctionStatus(auction)}
            cardStatus={cardStatus(votingPower > 0, auction)}
            isWinner={isWinner(winningIds, p.id)}
            stale={true}
          />
        </Col>
      ))}
    </>
  );
};

export default InfRoundProps;
