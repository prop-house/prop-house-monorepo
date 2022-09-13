import classes from './HomeProposalCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import {
  CommunityWithAuctions,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import { AuctionStatus } from '../../utils/auctionStatus';
import { ProposalCardStatus } from '../../utils/cardStatus';
import { VoteAllotment } from '../../utils/voteAllotment';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import CommunityProfImg from '../CommunityProfImg';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';

const HomeProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus?: AuctionStatus;
  cardStatus?: ProposalCardStatus;
  voteAllotments?: VoteAllotment[];
  canAllotVotes?: () => boolean;
  handleVoteAllotment?: (proposalId: number, support: boolean) => void;
  fromHome?: boolean;
  communityName?: CommunityWithAuctions | undefined;
}> = props => {
  const { proposal, cardStatus, fromHome } = props;

  let navigate = useNavigate();

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
          classNames={clsx(
            cardStatus === ProposalCardStatus.Voting
              ? clsx(globalClasses.yellowBorder, classes.proposalCardVoting)
              : cardStatus === ProposalCardStatus.Winner
              ? globalClasses.pinkBorder
              : '',
            classes.proposalCard,
          )}
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

          <div className={classes.communityInfo}>
            <CommunityProfImg />
            <div className={classes.proposalText}>
              <p className={classes.proposalEns}>
                <EthAddress address={proposal.address} truncate />
              </p>
              <p className={classes.proposalCommunityName}>in `community.name`</p>
            </div>
          </div>

          <hr className={classes.divider} />

          <div className={classes.timestampAndlinkContainer}>
            <div className={classes.address}>
              <div className={classes.scoreCopy}>Read more →</div>
            </div>

            <div className={classes.avatarAndPropNumber}>
              <div className={classes.date}>{diffTime(proposal.createdDate)}</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default HomeProposalCard;
