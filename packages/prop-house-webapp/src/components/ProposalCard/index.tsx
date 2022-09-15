import classes from './ProposalCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { AuctionStatus } from '../../utils/auctionStatus';
import { ProposalCardStatus } from '../../utils/cardStatus';
import { VoteAllotment } from '../../utils/voteAllotment';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import PropCardVotingModule from '../PropCardVotingModule';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { useEthers } from '@usedapp/core';

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus: AuctionStatus;
  cardStatus: ProposalCardStatus;
  voteAllotments: VoteAllotment[];
  canAllotVotes: boolean;
  handleVoteAllotment: (proposalId: number, support: boolean) => void;
  fromHome?: boolean;
  winner?: boolean;
}> = props => {
  const {
    proposal,
    auctionStatus,
    cardStatus,
    voteAllotments,
    canAllotVotes,
    handleVoteAllotment,
    fromHome,
    winner,
  } = props;

  const { account } = useEthers();
  let navigate = useNavigate();

  const roundIsVotingOrOver = () =>
    auctionStatus === AuctionStatus.AuctionVoting || auctionStatus === AuctionStatus.AuctionEnded;
  const connectedDuringVoting = () => auctionStatus === AuctionStatus.AuctionVoting && account;

  return (
    <>
      <div
        onClick={e => {
          if (cmdPlusClicked(e)) {
            window.open(`${fromHome ? `proposal/${proposal.id}` : proposal.id}`, `_blank`); // open in new tab
          } else {
            navigate(`${fromHome ? `proposal/${proposal.id}` : proposal.id}`);
          }
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={clsx(classes.proposalCard, winner && classes.winner)}
        >
          <div className={classes.textContainter}>
            <div className={classes.titleContainer}>
              <div className={classes.authorContainer}>{proposal.title}</div>
            </div>

            <ReactMarkdown
              className={classes.truncatedTldr}
              children={proposal.tldr}
              disallowedElements={['img', '']}
              components={{
                h1: 'p',
                h2: 'p',
                h3: 'p',
              }}
            ></ReactMarkdown>
          </div>

          <hr className={classes.divider} />

          <div className={classes.timestampAndlinkContainer}>
            <div className={classes.address}>
              <EthAddress address={proposal.address} truncate />

              <span className={clsx(classes.bullet, connectedDuringVoting() && classes.hideDate)}>
                {' • '}
              </span>
              <div
                className={clsx(classes.date, connectedDuringVoting() && classes.hideDate)}
                title={detailedTime(proposal.createdDate)}
              >
                {diffTime(proposal.createdDate)}
              </div>
            </div>

            <div
              className={clsx(
                classes.avatarAndPropNumber,
                !roundIsVotingOrOver() && classes.hideVoteModule,
              )}
            >
              <div className={classes.scoreCopy} title={detailedTime(proposal.createdDate)}>
                {roundIsVotingOrOver() && (
                  <div className={classes.scoreAndIcon}>
                    <VoteIcon /> {Number(proposal.score).toFixed()}
                  </div>
                )}

                {cardStatus === ProposalCardStatus.Voting && (
                  <div className={classes.votingArrows}>
                    <span className={classes.plusArrow}>+</span>
                    <PropCardVotingModule
                      proposal={proposal}
                      cardStatus={cardStatus}
                      voteAllotments={voteAllotments}
                      canAllotVotes={canAllotVotes}
                      handleVoteAllotment={handleVoteAllotment}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ProposalCard;
