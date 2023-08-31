import classes from './ProposalCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import detailedTime from '../../utils/detailedTime';
import clsx from 'clsx';
import { AuctionStatus } from '../../utils/auctionStatus';
import { ProposalCardStatus } from '../../utils/cardStatus';
import diffTime from '../../utils/diffTime';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import VotesDisplay from '../VotesDisplay';
import { useAppSelector } from '../../hooks';
import { nameToSlug } from '../../utils/communitySlugs';
import { useDispatch } from 'react-redux';
import {
  InfRoundFilterType,
  setActiveProposal,
  setModalActive,
} from '../../state/slices/propHouse';
import Tooltip from '../Tooltip';
import { MdInfoOutline } from 'react-icons/md';
import { BiAward } from 'react-icons/bi';
import Divider from '../Divider';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { useEffect, useState } from 'react';
import { isTimedAuction } from '../../utils/auctionType';
import { isMobile } from 'web3modal';
import ReplyBar from '../ReplyBar';
import InfRoundVotingControls from '../InfRoundVotingControls';
import TimedRoundVotingControls from '../TimedRoundVotingControls';
import { replaceIpfsGateway } from '../../utils/ipfs';

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus: AuctionStatus;
  cardStatus: ProposalCardStatus;
  isWinner: boolean;
  stale?: boolean;
}> = props => {
  const { proposal, auctionStatus, cardStatus, isWinner, stale } = props;

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const infRoundFilter = useAppSelector(state => state.propHouse.infRoundFilterType);
  const dispatch = useDispatch();

  const roundIsActive = () =>
    auctionStatus === AuctionStatus.AuctionAcceptingProps ||
    auctionStatus === AuctionStatus.AuctionVoting;

  const showVoteDisplay =
    round && isTimedAuction(round)
      ? auctionStatus === AuctionStatus.AuctionVoting ||
        auctionStatus === AuctionStatus.AuctionEnded
      : infRoundFilter !== InfRoundFilterType.Active;

  const showVoteControls =
    round && isTimedAuction(round)
      ? auctionStatus === AuctionStatus.AuctionVoting ||
        auctionStatus === AuctionStatus.AuctionEnded
      : infRoundFilter === InfRoundFilterType.Active;

  const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);
  const [displayTldr, setDisplayTldr] = useState<boolean | undefined>();

  useEffect(() => {
    let imgUrl;

    const getImg = async () => {
      imgUrl = await getFirstImageFromProp(proposal);
      setImgUrlFromProp(imgUrl);
      setDisplayTldr(!isMobile() || (isMobile() && !imgUrl));
    };
    getImg();
  }, [proposal]);

  return (
    <>
      <div
        onClick={e => {
          if (!community || !round) return;

          if (cmdPlusClicked(e)) {
            openInNewTab(`${nameToSlug(round.title)}/${proposal.id}`);
            return;
          }

          dispatch(setModalActive(true));
          dispatch(setActiveProposal(proposal));
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.thirty}
          classNames={clsx(
            classes.proposalCard,
            isWinner && auctionStatus === AuctionStatus.AuctionEnded && classes.winner,
            stale && classes.stale,
          )}
        >
          <div className={classes.propInfo}>
            <div className={classes.textContainter}>
              <div>
                <div className={classes.titleContainer}>
                  {isWinner && (
                    <div className={classes.crownNoun}>
                      <img src="/heads/crown.png" alt="crown" />
                    </div>
                  )}
                  <div className={classes.propTitle}>{proposal.title}</div>
                </div>

                {displayTldr && (
                  <ReactMarkdown
                    className={classes.truncatedTldr}
                    children={proposal.tldr}
                    disallowedElements={['img', '']}
                    components={{
                      h1: 'p',
                      h2: 'p',
                      h3: 'p',
                    }}
                  />
                )}
              </div>
            </div>

            {imgUrlFromProp && (
              <div className={classes.propImgContainer}>
                <img src={replaceIpfsGateway(imgUrlFromProp)} crossOrigin="anonymous" alt="propCardImage" />
              </div>
            )}
          </div>

          <Divider />

          <div className={classes.submissionInfoContainer}>
            <div className={classes.addressAndTimestamp}>
              <EthAddress address={proposal.address} className={classes.truncate} addAvatar />

              <span className={clsx(classes.bullet, roundIsActive() && classes.hideDate)}>
                {' • '}
              </span>
              {proposal.lastUpdatedDate !== null ? (
                <Tooltip
                  content={
                    <div
                      className={clsx(classes.date, roundIsActive() && classes.hideDate)}
                      title={detailedTime(proposal.createdDate)}
                    >
                      {diffTime(proposal.createdDate)}

                      <span className="infoSymbol">
                        <MdInfoOutline />
                      </span>
                    </div>
                  }
                  tooltipContent={`edited ${diffTime(proposal.lastUpdatedDate)}`}
                />
              ) : (
                <div
                  className={clsx(classes.date, roundIsActive() && classes.hideDate)}
                  title={detailedTime(proposal.createdDate)}
                >
                  {diffTime(proposal.createdDate)}
                </div>
              )}
              {proposal.reqAmount && (
                <>
                  {' '}
                  <span className={clsx(classes.bullet, roundIsActive() && classes.hideDate)}>
                    {' • '}
                  </span>
                  <div
                    className={clsx(classes.date, roundIsActive() && classes.hideDate)}
                    title={detailedTime(proposal.createdDate)}
                  >
                    <BiAward />
                    {`${proposal.reqAmount} ${round?.currencyType}`}
                  </div>
                </>
              )}
            </div>
            <div className={classes.timestampAndlinkContainer}>
              <div className={clsx(classes.avatarAndPropNumber)}>
                <div className={classes.voteCountCopy} title={detailedTime(proposal.createdDate)}>
                  {showVoteDisplay && <VotesDisplay proposal={proposal} />}
                  {showVoteControls &&
                    (round && isTimedAuction(round) ? (
                      <>
                        {cardStatus === ProposalCardStatus.Voting && (
                          <div className={classes.votingArrows}>
                            <span className={classes.plusArrow}>+</span>
                            <TimedRoundVotingControls proposal={proposal} />
                          </div>
                        )}
                      </>
                    ) : (
                      <InfRoundVotingControls proposal={proposal} />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
      {round && round.displayComments && <ReplyBar proposal={proposal} />}
    </>
  );
};

export default ProposalCard;
