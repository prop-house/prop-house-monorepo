import {
  CommunityWithAuctions,
  StoredAuction,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
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
import useWeb3Modal from '../../hooks/useWeb3Modal';
import isWinner from '../../utils/isWinner';
import getWinningIds from '../../utils/getWinningIds';
import UserPropCard from '../UserPropCard';
import AcceptingPropsModule from '../AcceptingPropsModule';
import VotingModule from '../VotingModule';
import RoundOverModule from '../RoundOverModule';

import { useEffect, useState } from 'react';

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
  const [userProposals, setUserProposals] = useState<StoredProposalWithVotes[]>();

  // auction statuses
  const auctionNotStarted = auctionStatus(auction) === AuctionStatus.AuctionNotStarted;
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const isRoundOver = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const getVoteTotal = () =>
    proposals && proposals.reduce((total, prop) => (total = total + Number(prop.score)), 0);

  useEffect(() => {
    if (!account || !proposals) return;

    if (proposals.some(p => p.address === account)) {
      return setUserProposals(
        proposals
          .filter(p => p.address === account)
          .sort((a: { score: any }, b: { score: any }) =>
            Number(a.score) < Number(b.score) ? 1 : -1,
          ),
      );
    }
  }, [account, proposals]);

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
        {!auctionNotStarted && account && userProposals && userProposals.length > 0 && (
          <UserPropCard
            userProps={userProposals}
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
                votesLeft={votesLeft}
                submittedVotesCount={submittedVotesCount}
                numAllottedVotes={numAllottedVotes}
              />
            )}

            {/* ROUND ENDED */}
            {isRoundOver && (
              <RoundOverModule
                numOfProposals={proposals && proposals.length}
                totalVotes={getVoteTotal()}
              />
            )}
          </div>

          {/* BUTTONS */}
          <div className={classes.btnContainer}>
            {/* ACCEPTING PROPS */}
            {isProposingWindow &&
              (account ? (
                <Button
                  text={'Create your proposal'}
                  bgColor={ButtonColor.Green}
                  onClick={() => navigate('/create', { state: { auction, community } })}
                />
              ) : (
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
