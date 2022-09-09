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
// import { useTranslation } from 'react-i18next';

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus?: AuctionStatus;
  cardStatus?: ProposalCardStatus;
  votesFor?: number;
  voteAllotments?: VoteAllotment[];
  canAllotVotes?: () => boolean;
  handleVoteAllotment?: (proposalId: number, support: boolean) => void;
  fromHome?: boolean;
  winner?: boolean;
}> = props => {
  const {
    proposal,
    auctionStatus,
    cardStatus,
    votesFor,
    voteAllotments,
    canAllotVotes,
    handleVoteAllotment,
    fromHome,
    winner,
  } = props;
  // const { t } = useTranslation();

  let navigate = useNavigate();

  return (
    <>
      <div
        onClick={e => {
          if (e.metaKey || e.ctrlKey) {
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
              <span className={classes.bullet}>{' • '}</span>
              <div className={classes.date} title={detailedTime(proposal.createdDate)}>
                {diffTime(proposal.createdDate)}
              </div>
            </div>

            <div className={classes.avatarAndPropNumber}>
              <div className={classes.scoreCopy} title={detailedTime(proposal.createdDate)}>
                {(auctionStatus === AuctionStatus.AuctionVoting ||
                  auctionStatus === AuctionStatus.AuctionEnded) && (
                  <div className={classes.scoreAndIcon}>
                    <VoteIcon /> {Number(proposal.score).toFixed()}
                  </div>
                )}

                {cardStatus === ProposalCardStatus.Voting &&
                  votesFor !== undefined &&
                  voteAllotments &&
                  canAllotVotes &&
                  handleVoteAllotment && (
                    <div className={classes.votingArrows}>
                      <span className={classes.plusArrow}>+</span>

                      <PropCardVotingModule
                        props={{
                          proposal,
                          cardStatus,
                          votesFor,
                          voteAllotments,
                          canAllotVotes,
                          handleVoteAllotment,
                        }}
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
