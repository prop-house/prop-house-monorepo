import { CommunityWithAuctions, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import classes from './ProposalCards.module.css';
import { Row, Col } from 'react-bootstrap';
import ProposalCard from '../ProposalCard';
import { useAppSelector } from '../../hooks';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { cardStatus } from '../../utils/cardStatus';
import { useEthers } from '@usedapp/core';
import extractAllVotes from '../../utils/extractAllVotes';
import { VoteAllotment } from '../../utils/voteAllotment';
import { aggVoteWeightForProp } from '../../utils/aggVoteWeight';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

const ProposalCards: React.FC<{
  auction: StoredAuction;
  community: CommunityWithAuctions;
  voteAllotments: VoteAllotment[];
  canAllotVotes: () => boolean;
  handleVote?: () => void;
  handleVoteAllotment: (proposalId: number, support: boolean) => void;
}> = props => {
  const { auction, community, voteAllotments, canAllotVotes, handleVote, handleVoteAllotment } =
    props;

  const { account } = useEthers();
  const navigate = useNavigate();

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(state => state.propHouse.delegatedVotes);

  // auction status
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const isRoundOver = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  return (
    <div className={classes.propCards}>
      <Row>
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
              {isProposingWindow && (
                <>
                  <h1 className={classes.sideCardTitle}>{`Submit a prop`}</h1>
                  <p className={classes.sideCardBody}>
                    {
                      <>
                        Anyone can submit a proposal! Something about how the rounds and timing
                        works?
                        <br />
                        <br />
                        Each noun holder gets 10 votes per noun.
                      </>
                    }
                  </p>
                </>
              )}

              {isVotingWindow && (
                <>
                  <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
                    {`Cast your votes`}
                    <span className={classes.totalVotes}>100 total</span>
                  </h1>
                  <div className={classes.votingBar}></div>
                  <p className={classes.sideCardBody}>
                    {<>Nouns get 10 votes per each Noun they hold or are delegated.</>}
                  </p>
                </>
              )}
              {isRoundOver && (
                <>
                  <h1 className={classes.sideCardTitle}>{`Round ended`}</h1>

                  <p className={classes.sideCardBody}>
                    {
                      <>
                        This round ended, and winners have been voted on. The winning props are
                        highlighted in green, check them out!
                      </>
                    }
                  </p>
                </>
              )}
            </div>

            <div className={classes.btnContainer}>
              {isProposingWindow && (
                <Button
                  text={'Submit your proposal'}
                  bgColor={ButtonColor.Green}
                  onClick={() => navigate('/create', { state: { auction, community } })}
                />
              )}

              {isVotingWindow && (
                <Button text={'Submit votes'} bgColor={ButtonColor.Purple} onClick={handleVote} />
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
export default ProposalCards;
