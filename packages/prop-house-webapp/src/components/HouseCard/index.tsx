import classes from './HouseCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
// import { ProposalCardStatus } from '../../utils/cardStatus';
import { VoteAllotment } from '../../utils/voteAllotment';
import PropCardVotingContainer from '../PropCardVotingContainer';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import StatusPill from '../StatusPill';

const HouseCard: React.FC<{
  // proposal: StoredProposalWithVotes;
  // auctionStatus?: AuctionStatus;
  // cardStatus?: ProposalCardStatus;
  // votesFor?: number;
  // voteAllotments?: VoteAllotment[];
  // canAllotVotes?: () => boolean;
  // handleVoteAllotment?: (proposalId: number, support: boolean) => void;
  round: any;
}> = props => {
  const {
    // proposal,
    // auctionStatus,
    // cardStatus,
    round,
    // votesFor,
    // voteAllotments,
    // canAllotVotes,
    // handleVoteAllotment,
  } = props;
  // const { t } = useTranslation();

  let navigate = useNavigate();

  // console.log('round', round);
  return (
    <>
      <div
        onClick={e => {
          // if (e.metaKey || e.ctrlKey) {
          //   window.open(`/proposal/${proposal.id}`, `_blank`); // open in new tab
          // } else {
          //   navigate(`/proposal/${proposal.id}`);
          // }
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(
            // cardStatus === ProposalCardStatus.Voting
            //   ? clsx(globalClasses.yellowBorder, classes.proposalCardVoting)
            //   : cardStatus === ProposalCardStatus.Winner
            //   ? globalClasses.pinkBorder
            //   : '',
            auctionStatus(round) === AuctionStatus.AuctionEnded && classes.roundEnded,
            classes.houseCard,
          )}
        >
          <div className={classes.textContainter}>
            <div className={classes.titleContainer}>
              <div className={classes.authorContainer}>{round.title}</div>
              <StatusPill status={auctionStatus(round)} />
            </div>

            <div className={classes.truncatedTldr}>
              Mandated round inviting builders to build alternative Nouns Clients. Builders can
              propose any idea to corresponds to the specified mandate.
            </div>
          </div>

          <div className={classes.roundInfo}>
            <div className={clsx(classes.section, classes.funding)}>
              <p className={classes.title}>Funding</p>
              <p className={classes.info}>
                <span className="">999 ETH</span>
                <span className={classes.xDivide}>{' x '}</span>
                <span className="">99</span>
              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <p className={classes.title}>Voting ends</p>
              <p className={classes.info}>August 99</p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <p className={classes.title}>Proposals</p>
              <p className={classes.info}>9999</p>
            </div>
          </div>

          {/* <div className={classes.titleContainer}>
            <div className={classes.authorContainer}>{proposal.title}</div>
            <div className={classes.timestamp}>#{proposal.id}</div>
          </div> */}

          {/* {proposal.tldr.length > 0 && (
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
          )} */}

          {/* <div className={classes.timestampAndlinkContainer}>
            {auctionStatus === AuctionStatus.AuctionVoting ||
            (auctionStatus === AuctionStatus.AuctionEnded &&
              cardStatus !== ProposalCardStatus.Voting) ? (
              <div className={classes.scoreCopy}>
                {t('votes')}: {Math.trunc(proposal.score)}
              </div>
            ) : (
              <div className={classes.address}>
                <EthAddress address={proposal.address} truncate />
              </div>
            )}

            <div className={classes.avatarAndPropNumber}>
              <div className={classes.scoreCopy} title={detailedTime(proposal.createdDate)}>
                {diffTime(proposal.createdDate)}
              </div>
            </div>
          </div> */}

          {/* {cardStatus === ProposalCardStatus.Voting &&
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
            )} */}
        </Card>
      </div>
    </>
  );
};

export default HouseCard;
