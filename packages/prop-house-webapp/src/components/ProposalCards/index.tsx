import { CommunityWithAuctions, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import classes from './ProposalCards.module.css';
import { Row, Col, ProgressBar } from 'react-bootstrap';
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
import useWeb3Modal from '../../hooks/useWeb3Modal';
import isWinner from '../../utils/isWinner';
import getWinningIds from '../../utils/getWinningIds';
import UserPropCard from '../UserPropCard';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import AcceptingPropsModule from '../AcceptingPropsModule';
import VotingModule from '../VotingModule';

const ProposalCards: React.FC<{
  auction: StoredAuction;
  community: CommunityWithAuctions;
  voteAllotments: VoteAllotment[];
  canAllotVotes: () => boolean;
  numAllottedVotes?: number;
  submittedVotesCount?: number;
  handleVote?: () => void;
  handleVoteAllotment: (proposalId: number, support: boolean) => void;
  votesLeft?: number;
}> = props => {
  const {
    auction,
    community,
    voteAllotments,
    canAllotVotes,
    numAllottedVotes,
    submittedVotesCount,
    handleVote,
    handleVoteAllotment,
    votesLeft,
  } = props;

  const { account } = useEthers();
  const connect = useWeb3Modal();
  const navigate = useNavigate();

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const delegatedVotes = useAppSelector(state => state.propHouse.delegatedVotes);
  const winningIds = getWinningIds(proposals, auction);

  // auction statuses
  const auctionNotStarted = auctionStatus(auction) === AuctionStatus.AuctionNotStarted;
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const isRoundOver = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const getVoteTotal = () =>
    proposals && proposals.reduce((total, prop) => (total = total + Number(prop.score)), 0);

  const hasSubmittedProp = () => account && proposals && proposals.some(p => p.address === account);
  const userProps =
    account &&
    proposals &&
    hasSubmittedProp() &&
    proposals
      .filter(p => p.address === account)
      .sort((a: { score: any }, b: { score: any }) => (Number(a.score) < Number(b.score) ? 1 : -1));

  return (
    <Row className={classes.propCardsRow}>
      <Col xl={8} className={classes.propCardsCol}>
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
                  winner={winningIds && isWinner(winningIds, proposal.id)}
                />
              </Col>
            );
          })}
      </Col>

      <Col xl={4} className={clsx(classes.sideCards, classes.carousel, classes.breakOut)}>
        {account && hasSubmittedProp() && !auctionNotStarted && (
          <UserPropCard
            userProps={userProps}
            proposals={proposals}
            numOfWinners={auction.numWinners}
            status={auctionStatus(auction)}
            winningIds={winningIds && winningIds}
            totalVotes={getVoteTotal()}
          />
        )}

        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={classes.sidebarContainerCard}
        >
          {/* CONTENT */}
          <div className={classes.content}>
            {/* ACCEPTING PROPS */}
            {isProposingWindow && (
              <AcceptingPropsModule auction={auction} communityName={community.name} />
            )}

            {/* VOTING WINDOW */}
            {isVotingWindow && (
              <VotingModule
                delegatedVotes={delegatedVotes}
                communityName={community.name}
                totalVotes={getVoteTotal()}
              />
            )}

            {/* VOTING WINDOW WITH VOTES: PROGRESS BAR */}
            {isVotingWindow && account && delegatedVotes ? (
              <>
                <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
                  <span>Cast your votes</span>

                  <span className={classes.totalVotes}>{`${
                    votesLeft && votesLeft > 0
                      ? `${
                          delegatedVotes - (submittedVotesCount ?? 0) - (numAllottedVotes ?? 0)
                        } left`
                      : 'no votes left'
                  }`}</span>
                </h1>

                <ProgressBar
                  className={clsx(
                    classes.votingBar,
                    submittedVotesCount &&
                      submittedVotesCount > 0 &&
                      delegatedVotes !== submittedVotesCount &&
                      'roundAllotmentBar',
                  )}
                >
                  <ProgressBar
                    variant="success"
                    now={
                      100 -
                      Math.abs(((submittedVotesCount ?? 0) - delegatedVotes) / delegatedVotes) * 100
                    }
                  />

                  <ProgressBar
                    variant="warning"
                    now={Math.abs(((votesLeft ?? 0) - delegatedVotes) / delegatedVotes) * 100}
                    key={2}
                  />
                </ProgressBar>
              </>
            ) : (
              <></>
            )}

            {/* ROUND ENDED */}
            {isRoundOver && (
              <>
                <div className={classes.sideCardHeader}>
                  <div className={clsx(classes.icon, classes.blackIcon)}>
                    <VoteIcon />
                  </div>
                  <div className={classes.textContainer}>
                    <p className={classes.title}>Voting ended</p>
                    {proposals && (
                      <p className={classes.subtitle}>
                        {getVoteTotal()?.toFixed()}{' '}
                        {Number(getVoteTotal()?.toFixed()) === 1 ? 'vote' : 'votes'} cast for{' '}
                        {proposals.length} props!
                      </p>
                    )}
                  </div>
                </div>

                <hr className={classes.divider} />

                <p className={clsx(classes.sideCardBody, classes.winnersText)}>
                  Winners are highlighted in <span className={classes.greenText}>green</span>.
                </p>
              </>
            )}
          </div>

          {/* BUTTONS */}
          <div className={classes.btnContainer}>
            {/* ACCEPTING PROPS */}
            {isProposingWindow &&
              (account ? (
                // WALLET CONNECTED
                <Button
                  text={'Create your proposal'}
                  bgColor={ButtonColor.Green}
                  onClick={() => navigate('/create', { state: { auction, community } })}
                />
              ) : (
                // WALLET NOT CONNECTED
                <Button text={'Connect to submit'} bgColor={ButtonColor.Pink} onClick={connect} />
              ))}

            {/* VOTING WINDOW, NOT CONNECTED */}
            {isVotingWindow && !account && (
              <Button text={'Connect to vote'} bgColor={ButtonColor.Pink} onClick={connect} />
            )}

            {/* VOTING PERIOD, CONNECTED, HAS VOTES */}
            {isVotingWindow && account && delegatedVotes ? (
              <Button
                text={'Submit votes'}
                bgColor={ButtonColor.Purple}
                onClick={handleVote}
                disabled={numAllottedVotes === 0 || submittedVotesCount === delegatedVotes}
              />
            ) : (
              //  VOTING PERIOD, CONNECTED, HAS NO VOTES
              <></>
            )}
          </div>
        </Card>
      </Col>
    </Row>
  );
};
export default ProposalCards;
