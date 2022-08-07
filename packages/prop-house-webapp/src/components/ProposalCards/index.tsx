import { StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import classes from './ProposalCards.module.css';
import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';
import { useAppSelector } from '../../hooks';
import { auctionStatus } from '../../utils/auctionStatus';
import { cardStatus } from '../../utils/cardStatus';
import { useEthers } from '@usedapp/core';
import extractAllVotes from '../../utils/extractAllVotes';
import { VoteAllotment } from '../../utils/voteAllotment';
import { aggVoteWeightForProp } from '../../utils/aggVoteWeight';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Button, { ButtonColor } from '../Button';

const ProposalCards: React.FC<{
  auction: StoredAuction;
  voteAllotments: VoteAllotment[];
  canAllotVotes: () => boolean;
  handleVoteAllotment: (proposalId: number, support: boolean) => void;
}> = props => {
  const { auction, voteAllotments, canAllotVotes, handleVoteAllotment } = props;

  const { account } = useEthers();

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(state => state.propHouse.delegatedVotes);

  return (
    <div className={classes.propCards}>
      <Row style={{ width: '100%' }}>
        <Col xl={8}>
          {proposals &&
            proposals.map((proposal, index) => {
              return (
                <Col key={index}>
                  <ProposalCard
                    proposal={proposal}
                    auctionStatus={auctionStatus(auction)}
                    cardStatus={cardStatus(delegatedVotes ? delegatedVotes > 0 : false, auction)}
                    votesFor={aggVoteWeightForProp(
                      extractAllVotes(proposals ? proposals : [], account ? account : ''),
                      proposal.id,
                    )}
                    canAllotVotes={canAllotVotes}
                    voteAllotments={voteAllotments}
                    handleVoteAllotment={handleVoteAllotment}
                  />
                </Col>
              );
            })}
        </Col>
        <Col xl={4}>
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.thirty}
            classNames={classes.sidebarContainerCard}
          >
            <div className={classes.content}>
              <h1 style={{ fontSize: '1.5rem' }}>{`title`}</h1>
              <p style={{ marginBottom: '0' }}>{`content`}</p>
            </div>
            <div className={classes.btnContainer}>
              <Button
                text={`Submit votes`}
                bgColor={ButtonColor.Purple}
                // onClick={btnAction}
              />
            </div>
          </Card>
        </Col>
      </Row>
      {/* <Row>
      </Row> */}
    </div>
  );
};
export default ProposalCards;
