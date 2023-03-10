import classes from './StatusRoundCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Community, StoredAuction } from '@nouns/prop-house-wrapper/dist/builders';
import clsx from 'clsx';
import {
  auctionStatus,
  AuctionStatus,
  deadlineCopy,
  deadlineTime,
} from '../../utils/auctionStatus';
import { useNavigate } from 'react-router-dom';
import StatusPill from '../StatusPill';
import { nameToSlug } from '../../utils/communitySlugs';
import diffTime from '../../utils/diffTime';
import { useTranslation } from 'react-i18next';
import Tooltip from '../Tooltip';
import dayjs from 'dayjs';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setActiveRound } from '../../state/slices/propHouse';
import TruncateThousands from '../TruncateThousands';
import { useEffect, useMemo, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useAccount } from 'wagmi';
import { InfuraProvider } from '@ethersproject/providers';
import { getNumVotes } from 'prop-house-communities';
import Countdown from '../Countdown';

const StatusRoundCard: React.FC<{
  round: StoredAuction;
}> = props => {
  const { round } = props;

  const { t } = useTranslation();

  const [community, setCommunity] = useState<Community | undefined>();
  const [numVotesCasted, setNumVotesCasted] = useState<number | undefined | null>(undefined);
  const [votingPower, setVotingPower] = useState<number | undefined | null>(undefined);
  const [statusCopy, setStatusCopy] = useState('...');
  const [numProps, setNumProps] = useState<number | undefined>(undefined);
  const [numVotes, setNumVotes] = useState<number | undefined>(undefined);

  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = useMemo(() => new PropHouseWrapper(host), [host]);

  const { address: account } = useAccount();

  // timestamp to fetch latest prop/vote data (x votes/props y ago)
  const dayAgo = dayjs().subtract(1, 'day').unix() * 1000;
  const tenYearsAgo = dayjs().subtract(10, 'year').unix() * 1000;

  // fetch num votes casted & voting power
  useEffect(() => {
    if (!(auctionStatus(round) === AuctionStatus.AuctionVoting) || !community) return;

    if (!account) {
      setVotingPower(null);
      setNumVotesCasted(null);
      return;
    }

    const fetchVotesData = async () => {
      try {
        const numVotesCasted = await wrapper.getNumVotesCastedForRound(account, round.id);
        const votingPower = await getNumVotes(
          account,
          community.contractAddress,
          new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID),
          round.balanceBlockTag,
        );
        setVotingPower(votingPower);
        setNumVotesCasted(numVotesCasted);
      } catch (e) {
        console.log('error fetching votes data: ', e);
        setVotingPower(null);
        setNumVotesCasted(null);
      }
    };

    fetchVotesData();
  }, [setVotingPower, account, community, round, wrapper]);

  // num votes
  useEffect(() => {
    // fetch if voting && user has not voting power
    if (
      (!(auctionStatus(round) === AuctionStatus.AuctionVoting) &&
        !(auctionStatus(round) === AuctionStatus.AuctionEnded)) ||
      (votingPower && votingPower > 0)
    )
      return;
    const fetchNumVotes = async () => {
      const numVotes = await wrapper.getLatestNumVotes(
        round.id,
        auctionStatus(round) === AuctionStatus.AuctionEnded ? tenYearsAgo : dayAgo,
      );
      setNumVotes(numVotes);
    };
    fetchNumVotes();
  });

  // num props
  useEffect(() => {
    if (!(auctionStatus(round) === AuctionStatus.AuctionAcceptingProps)) return;
    const fetchNumProps = async () => {
      const numProps = await wrapper.getLatestNumProps(round.id, dayAgo);
      setNumProps(numProps);
    };
    fetchNumProps();
  });

  // fetch community
  useEffect(() => {
    if (community !== undefined) return;
    const fetchCommunity = async () =>
      setCommunity(await wrapper.getCommunityWithId(round.communityId));
    fetchCommunity();
  });

  // status bar copy
  useEffect(() => {
    // voting
    if (auctionStatus(round) === AuctionStatus.AuctionVoting) {
      if (votingPower === undefined || numVotesCasted === undefined) return;

      if ((votingPower === null && numVotesCasted === null) || votingPower === 0)
        setStatusCopy(`${numVotes} votes in the last 24 hrs`);

      if (votingPower !== null && numVotesCasted !== null && votingPower > 0)
        if (numVotesCasted === votingPower) {
          setStatusCopy(`You casted all your ${votingPower} votes!`);
        } else if (numVotesCasted > 0) {
          setStatusCopy(`You casted ${numVotesCasted} of ${votingPower} votes`);
        } else if (numVotesCasted === 0) {
          setStatusCopy(`You haven't voted yet!`);
        }

      // proposing
    } else if (auctionStatus(round) === AuctionStatus.AuctionAcceptingProps) {
      if (numProps === undefined) return;
      if (numProps === 0) {
        setStatusCopy('No props in the last 24 hrs');
      } else {
        numProps &&
          setStatusCopy(`${numProps} prop${numProps > 1 ? 's' : ''} submitted in the last 24 hrs`);
      }
    } else if (auctionStatus(round) === AuctionStatus.AuctionNotStarted) {
      setStatusCopy(`Round set to begin in `);
    } else if (auctionStatus(round) === AuctionStatus.AuctionEnded && numVotes) {
      const decimals = round.fundingAmount.toString().split('.')[1]?.length || 0;
      const amount = (round.fundingAmount * round.numWinners).toFixed(decimals);

      setStatusCopy(
        `${numVotes} votes awarded ${amount} ${round.currencyType} to ${round.numWinners} builders`,
      );
    }
  }, [votingPower, numVotesCasted, numProps, round, numVotes]);

  return (
    <>
      <div
        onClick={e => {
          if (!community) return;
          dispatch(setActiveRound(round));
          if (cmdPlusClicked(e)) {
            openInNewTab(
              `${window.location.href}/${nameToSlug(community.name)}/${nameToSlug(round.title)}`,
            );
            return;
          }
          navigate(`../${nameToSlug(community.name)}/${nameToSlug(round.title)}`);
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(
            auctionStatus(round) === AuctionStatus.AuctionEnded && classes.roundEnded,
            classes.roundCard,
          )}
        >
          <div className={classes.textContainer}>
            <div className={classes.topContainer}>
              <div className={classes.leftContainer}>
                <img src={community?.profileImageUrl} alt="community profile" />
                <div>{community?.name}</div>
              </div>
              <StatusPill status={auctionStatus(round)} />
            </div>
            <div className={classes.authorContainer}>{round.title}</div>
          </div>

          <div className={classes.roundInfo}>
            <div className={clsx(classes.section, classes.funding)}>
              <p className={classes.title}>{t('funding')}</p>
              <p className={classes.info}>
                <span className="">
                  <TruncateThousands amount={round.fundingAmount} decimals={2} />
                  {` ${round.currencyType}`}
                </span>
                <span className={classes.xDivide}>{' × '}</span>
                <span className="">{round.numWinners}</span>
              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <Tooltip
                content={
                  <>
                    <p className={classes.title}>{deadlineCopy(round)}</p>
                    <p className={classes.info}>
                      {diffTime(deadlineTime(round)).replace('months', 'mos')}{' '}
                    </p>
                  </>
                }
                tooltipContent={`${dayjs(deadlineTime(round))
                  .tz()
                  .format('MMMM D, YYYY h:mm A z')}`}
              />
            </div>

            <div className={clsx(classes.divider, classes.propSection)}></div>

            <div className={clsx(classes.section, classes.propSection)}>
              <p className={classes.title}> {t('proposalsCap')}</p>
              <p className={classes.info}>{round.numProposals}</p>
            </div>
          </div>

          <div
            className={clsx(
              classes.statusRow,
              auctionStatus(round) === AuctionStatus.AuctionVoting
                ? classes.voting
                : auctionStatus(round) === AuctionStatus.AuctionAcceptingProps
                ? classes.proposing
                : classes.notStartedOrEnded,
            )}
          >
            {auctionStatus(round) === AuctionStatus.AuctionNotStarted ? (
              <Countdown date={round.startTime} />
            ) : (
              statusCopy
            )}
          </div>
        </Card>
      </div>
    </>
  );
};

export default StatusRoundCard;
