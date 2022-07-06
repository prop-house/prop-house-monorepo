import classes from './ProposalCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { AuctionStatus } from '../../utils/auctionStatus';
import { ProposalCardStatus } from '../../utils/cardStatus';
import { VoteAllotment } from '../../utils/voteAllotment';
import PropCardVotingContainer from '../PropCardVotingContainer';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import { useNavigate } from 'react-router-dom';

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus?: AuctionStatus;
  cardStatus?: ProposalCardStatus;
  votesFor?: number;
  voteAllotments?: VoteAllotment[];
  canAllotVotes?: () => boolean;
  handleVoteAllotment?: (proposalId: number, support: boolean) => void;
}> = (props) => {
  const {
    proposal,
    auctionStatus,
    cardStatus,
    votesFor,
    voteAllotments,
    canAllotVotes,
    handleVoteAllotment,
  } = props;

  let navigate = useNavigate();

  return (
    <>
      <div
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey) {
            window.open(`/proposal/${proposal.id}`, `_blank`); // open in new tab
          } else {
            navigate(`/proposal/${proposal.id}`);
          }
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(
            cardStatus === ProposalCardStatus.Voting
              ? clsx(globalClasses.yellowBorder, classes.proposalCardVoting)
              : cardStatus === ProposalCardStatus.Winner
              ? globalClasses.pinkBorder
              : '',
            classes.proposalCard
          )}
        >
          <div className={classes.titleContainer}>
            <div className={classes.authorContainer}>{proposal.title}</div>
            <div className={classes.timestamp}>#{proposal.id}</div>
          </div>

          {proposal.tldr.length > 0 && (
            <div className={classes.truncatedTldr}>{proposal.tldr}</div>
          )}

          <div className={classes.timestampAndlinkContainer}>
            {auctionStatus === AuctionStatus.AuctionVoting ||
            (auctionStatus === AuctionStatus.AuctionEnded &&
              cardStatus !== ProposalCardStatus.Voting) ? (
              <div className={classes.scoreCopy}>
                Votes: {Math.trunc(proposal.score)}
              </div>
            ) : (
              <EthAddress address={proposal.address} />
            )}

            <div className={classes.avatarAndPropNumber}>
              <div
                className={classes.scoreCopy}
                title={detailedTime(proposal.createdDate)}
              >
                {diffTime(proposal.createdDate)}
              </div>
            </div>
          </div>

          {cardStatus === ProposalCardStatus.Voting &&
            votesFor !== undefined &&
            voteAllotments &&
            canAllotVotes &&
            handleVoteAllotment && (
              <PropCardVotingContainer
                props={{
                  proposal,
                  cardStatus,
                  votesFor,
                  voteAllotments,
                  canAllotVotes,
                  handleVoteAllotment,
                }}
              />
            )}
        </Card>
      </div>
    </>
  );
};

export default ProposalCard;
