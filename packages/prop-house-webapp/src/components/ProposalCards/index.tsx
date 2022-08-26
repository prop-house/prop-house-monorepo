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
import { MdOutlineLightbulb as BulbIcon, MdHowToVote as VoteIcon } from 'react-icons/md';
// import RoundMessage from '../RoundMessage';
import dayjs from 'dayjs';
import { findProposalByAddress } from '../../utils/findProposalByAddress';
import isWinner from '../../utils/isWinner';
import getWinningIds from '../../utils/getWinningIds';

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

  // auction status
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const isRoundOver = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const hasSubmittedProp = () => account && proposals && proposals.some(p => p.address === account);
  const getVoteTotal = () =>
    proposals && proposals.reduce((total, prop) => (total = total + Number(prop.score)), 0);
  // proposals && account && console.log('hasSubmittedProp', hasSubmittedProp());

  // proposals &&
  //   account &&
  //   console.log('findProposalByAddress', findProposalByAddress(account, proposals));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const myProp =
    account && proposals && hasSubmittedProp() && findProposalByAddress(account, proposals);

  const winningIds = getWinningIds(proposals, auction);

  return (
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
                  winner={winningIds && isWinner(winningIds, proposal.id)}
                />
              </Col>
            );
          })}
      </Col>

      <Col xl={4}>
        {/* VOTING, CONNECTED, YOUR PROP */}
        {/* {isVotingWindow && account && hasSubmittedProp() && (
          <Card
            bgColor={CardBgColor.White}
            borderRadius={CardBorderRadius.thirty}
            classNames={clsx(classes.sidebarContainerCard, classes.userPropCard)}
          >
            
          <p className={classes.userPropTitle}>{myProp && myProp.title}</p>

            <div className={classes.userPropInfo}>
              <div className={classes.userPropItem}>
                <div>
                  <VoteIcon />
                </div>
                <div>
                  x<sup>th</sup> place
                </div>
              </div>

              <div className={classes.userPropItem}>
                <div>
                  <VoteIcon />
                </div>
                <div>{myProp && `${myProp.score} votes`}</div>
              </div>
            </div>
          </Card>
        )} */}

        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={classes.sidebarContainerCard}
        >
          {/* CONTENT */}
          <div className={classes.content}>
            {/* ACCEPTING PROPS */}
            {isProposingWindow && (
              <>
                <div className={classes.sideCardHeader}>
                  <div className={clsx(classes.icon, classes.greenIcon)}>
                    <BulbIcon />
                  </div>
                  <div className={classes.textContainer}>
                    <p className={classes.title}>{`Accepting proposals`}</p>
                    <p className={classes.subtitle}>
                      Until {dayjs(auction.proposalEndTime).format('MMMM D')}
                    </p>
                  </div>
                </div>

                <hr className={classes.divider} />

                <p className={classes.sideCardBody}>
                  <b>How proposals work:</b>

                  <div className={classes.bulletList}>
                    <div className={classes.bulletItem}>
                      <hr className={classes.bullet} />
                      <p>Anyone can submit a proposal to get funded.</p>
                    </div>

                    <div className={classes.bulletItem}>
                      <hr className={classes.bullet} />
                      <p>
                        Owners of the <b>{community.name}</b> token will vote on the best proposals.
                      </p>
                    </div>

                    {/*
                     *
                     * to be added back in
                     *
                     */}

                    {/* <div className={classes.bulletItem}>
                      <hr className={classes.bullet} />
                      <p>
                        Each <b>{community.name}</b> token has 10 votes.
                      </p>
                    </div> */}

                    <div className={classes.bulletItem}>
                      <hr className={classes.bullet} />
                      <p>
                        The top <b>{auction.numWinners}</b> proposals will get funded{' '}
                        <b>
                          {auction.fundingAmount} {auction.currencyType}{' '}
                        </b>
                        each.
                      </p>
                    </div>
                  </div>
                </p>
              </>
            )}

            {/* VOTING WINDOW */}
            {isVotingWindow && (
              <>
                {/* VOTING, CONNECTED & NOT CONNECTED */}
                <div className={classes.sideCardHeader}>
                  <div className={clsx(classes.icon, classes.purpleIcon)}>
                    <VoteIcon />
                  </div>
                  <div className={classes.textContainer}>
                    <p className={classes.title}>Voting in progress</p>
                    <p className={classes.subtitle}>
                      <span className={classes.purpleText}>{getVoteTotal()}</span> votes cast so
                      far!
                    </p>
                  </div>
                </div>

                <hr className={classes.divider} />

                {/* VOTING, NOT CONNECTED */}
                {!account && (
                  <p className={classes.sideCardBody}>
                    Owners of the <b>{community.name}</b> token are voting on their favorite
                    proposals.
                  </p>
                )}

                {/* VOTING, CONNECTED, NO VOTES */}
                {account && !delegatedVotes && (
                  <p className={classes.subtitle}>
                    <b>You don't have any {community.name} required to vote in this house.</b>
                  </p>
                )}
              </>
            )}

            {/* VOTING WINDOW WITH VOTES: PROGRESS BAR */}
            {isVotingWindow && account && delegatedVotes && votesLeft ? (
              <>
                <h1 className={clsx(classes.sideCardTitle, classes.votingInfo)}>
                  <span>Cast your votes</span>

                  <span className={classes.totalVotes}>{`${
                    votesLeft > 0
                      ? // ? `${votesLeft && votesLeft} left`
                        `${
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
                    // now={submittedVotesCount}
                    now={
                      100 -
                      Math.abs(((submittedVotesCount ?? 0) - delegatedVotes) / delegatedVotes) * 100
                    }
                  />

                  <ProgressBar
                    variant="warning"
                    now={Math.abs((votesLeft - delegatedVotes) / delegatedVotes) * 100}
                    key={2}
                  />
                </ProgressBar>

                <p className={classes.sideCardBody}>
                  {<>Nouns get 10 votes per each Noun they hold or are delegated.</>}
                </p>
              </>
            ) : null}

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
                      <p className={clsx(classes.subtitle, classes.purpleText)}>
                        {getVoteTotal()} votes cast for {proposals.length} props!
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

                // disabled={!canAllotVotes()}
              />
            ) : null}
          </div>
        </Card>
      </Col>
    </Row>
  );
};
export default ProposalCards;
