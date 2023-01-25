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
import PropCardVotingModule from '../PropCardVotingModule';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import VotesDisplay from '../VotesDisplay';
import { useAppSelector } from '../../hooks';
import { nameToSlug } from '../../utils/communitySlugs';
import { useDispatch } from 'react-redux';
import { setActiveProposal, setModalActive } from '../../state/slices/propHouse';
import Tooltip from '../Tooltip';
import { MdInfoOutline } from 'react-icons/md';
import Divider from '../Divider';
import getImageFromDescription from '../../utils/getImageFromDescription';
import { useEffect, useState } from 'react';

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus: AuctionStatus;
  cardStatus: ProposalCardStatus;
  isWinner: boolean;
}> = props => {
  const { proposal, auctionStatus, cardStatus, isWinner } = props;

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const dispatch = useDispatch();

  const roundIsVotingOrOver = () =>
    auctionStatus === AuctionStatus.AuctionVoting || auctionStatus === AuctionStatus.AuctionEnded;

  const roundIsActive = () =>
    auctionStatus === AuctionStatus.AuctionAcceptingProps ||
    auctionStatus === AuctionStatus.AuctionVoting;

  const [imageUrl, setImageUrl] = useState<string | undefined>('');

  useEffect(() => {
    getImageFromDescription(proposal)
      .then(url => setImageUrl(url))
      .catch(error => console.log(error));
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
            </div>

            {imageUrl && imageUrl !== '' ? (
              <div className={classes.propImgContainer}>
                <img src={imageUrl} alt="propCardImage" />
              </div>
            ) : (
              <></>
            )}
          </div>

          <Divider narrow />

          <div className={classes.submissionInfoContainer}>
            <div className={classes.addressAndTimestamp}>
              <EthAddress address={proposal.address} truncate />

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
            </div>

            {(auctionStatus === AuctionStatus.AuctionVoting ||
              auctionStatus === AuctionStatus.AuctionEnded) && (
              <div className={classes.timestampAndlinkContainer}>
                <div
                  className={clsx(
                    classes.avatarAndPropNumber,
                    !roundIsVotingOrOver() && classes.hideVoteModule,
                    // classes.hideVoteModule,
                  )}
                >
                  <div className={classes.voteCountCopy} title={detailedTime(proposal.createdDate)}>
                    {roundIsVotingOrOver() && <VotesDisplay proposal={proposal} />}
                    {cardStatus === ProposalCardStatus.Voting && (
                      <div className={classes.votingArrows}>
                        <span className={classes.plusArrow}>+</span>
                        <PropCardVotingModule proposal={proposal} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default ProposalCard;
