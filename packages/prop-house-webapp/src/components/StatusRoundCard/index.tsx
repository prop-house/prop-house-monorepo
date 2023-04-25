import classes from './StatusRoundCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import clsx from 'clsx';
import { deadlineCopy, deadlineTime } from '../../utils/auctionStatus';
import { useNavigate } from 'react-router-dom';
import StatusPill from '../StatusPill';
import diffTime from '../../utils/diffTime';
import { useTranslation } from 'react-i18next';
import Tooltip from '../Tooltip';
import dayjs from 'dayjs';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { useAppDispatch } from '../../hooks';
import { setActiveRound } from '../../state/slices/propHouse';
import TruncateThousands from '../TruncateThousands';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Countdown from '../Countdown';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { House, Round, RoundState, usePropHouse } from '@prophouse/sdk-react';
import { getDateFromTimestamp } from '../HouseManager/utils/getDateFromTimestamp';
import { useRoundDetails } from '../../hooks/useRoundDetails';
import { roundCompleted } from '../../utils/sdk';

const StatusRoundCard: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;

  const { t } = useTranslation();

  const propHouse = usePropHouse();
  const [roundDetails] = useRoundDetails(propHouse, round.address);
  //   const [numVotesCasted, setNumVotesCasted] = useState<number | undefined | null>(undefined);
  //   const [votingPower, setVotingPower] = useState<number | undefined | null>(undefined);
  //   const [statusCopy, setStatusCopy] = useState('...');
  //   const [numProps, setNumProps] = useState<number | undefined>(undefined);
  //   const [numVotes, setNumVotes] = useState<number | undefined>(undefined);

  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { address: account } = useAccount();

  // timestamp to fetch latest prop/vote data (x votes/props y ago)
  const dayAgo = dayjs().subtract(1, 'day').unix() * 1000;
  const tenYearsAgo = dayjs().subtract(10, 'year').unix() * 1000;

  //   // fetch num votes casted & voting power
  //   useEffect(() => {
  //     if (round?.state !== RoundState.IN_VOTING_PERIOD || !community) return;
  //     if (!account) {
  //       setVotingPower(null);
  //       setNumVotesCasted(null);
  //       return;
  //     }

  //     const fetchVotesData = async () => {
  //       try {
  //         // TODO: Use localstorage
  //         const numVotesCasted = await wrapper.getNumVotesCastedForRound(account, round.id);

  //         const { votingStrategies } = await propHouse.query.getRoundVotingStrategies(round.address);
  //         const votingPower = await propHouse.voting.getTotalVotingPower(
  //           account,
  //           round.config.proposalPeriodEndTimestamp,
  //           votingStrategies,
  //         );

  //         // const votingPower = await getVotingPower(
  //         //   account,
  //         //   community.contractAddress,
  //         //   new InfuraProvider(1, process.env.REACT_APP_INFURA_PROJECT_ID),
  //         //   round.balanceBlockTag,
  //         // );
  //         setVotingPower(votingPower.toNumber()); // TODO: Support base units
  //         setNumVotesCasted(numVotesCasted);
  //       } catch (e) {
  //         console.log('error fetching votes data: ', e);
  //         setVotingPower(null);
  //         setNumVotesCasted(null);
  //       }
  //     };

  //     fetchVotesData();
  //   }, [setVotingPower, account, community, round, propHouse.query, propHouse.voting]);

  //   // num votes
  //   useEffect(() => {
  //     if (round?.state < RoundState.IN_VOTING_PERIOD || (votingPower && votingPower > 0)) {
  //       return;
  //     }

  //     const fetchNumVotes = async () => {
  //       const roundVotes = await propHouse.query.getVotes({
  //         where: { round: '' } // TODO: Need to do source chain round
  //       });

  //       // const numVotes = await wrapper.getLatestNumVotes(
  //       //   round.address,
  //       //   auctionStatus(round) === AuctionStatus.AuctionEnded ? tenYearsAgo : dayAgo,
  //       // );
  //       setNumVotes(numVotes);
  //     };
  //     fetchNumVotes();
  //   });

  //   // num props
  //   useEffect(() => {
  //     if (round.state !== RoundState.IN_PROPOSING_PERIOD) return;
  //     const fetchNumProps = async () => {
  //       const numProps = await wrapper.getLatestNumProps(round.id, dayAgo);
  //       setNumProps(numProps);
  //     };
  //     fetchNumProps();
  //   });

  //   // status bar copy
  //   useEffect(() => {
  //     // voting
  //     if (round.state === RoundState.IN_VOTING_PERIOD) {
  //       if (votingPower === undefined || numVotesCasted === undefined) return;

  //       if ((votingPower === null && numVotesCasted === null) || votingPower === 0)
  //         setStatusCopy(`${numVotes} votes in the last 24 hrs`);

  //       if (votingPower !== null && numVotesCasted !== null && votingPower > 0)
  //         if (numVotesCasted === votingPower) {
  //           setStatusCopy(`You casted all your ${votingPower} votes!`);
  //         } else if (numVotesCasted > 0) {
  //           setStatusCopy(`You casted ${numVotesCasted} of ${votingPower} votes`);
  //         } else if (numVotesCasted === 0) {
  //           setStatusCopy(`You haven't voted yet!`);
  //         }

  //       // proposing
  //     } else if (round.state === RoundState.IN_PROPOSING_PERIOD) {
  //       if (numProps === undefined) return;
  //       if (numProps === 0) {
  //         setStatusCopy('No props in the last 24 hrs');
  //       } else {
  //         numProps &&
  //           setStatusCopy(`${numProps} prop${numProps > 1 ? 's' : ''} submitted in the last 24 hrs`);
  //       }
  //     } else if (round.state === RoundState.NOT_STARTED) {
  //       setStatusCopy(`Round set to begin in `);
  //     } else if (round.state >= RoundState.IN_CLAIMING_PERIOD && numVotes) {
  //       // TODO: More complex than this now
  //       // const decimals = round.fundingAmount.toString().split('.')[1]?.length || 0;

  //       // const amount = (round.fundingAmount * (isTimedAuction(round) ? round.numWinners : 1)).toFixed(
  //       //   decimals,
  //       // );

  //       // setStatusCopy(
  //       //   `${numVotes} votes awarded ${amount} ${round.currencyType} ${
  //       //     isTimedAuction(round) && `to ${round.numWinners} builders`
  //       //   }`,
  //       // );
  //     }
  //   }, [votingPower, numVotesCasted, numProps, round, numVotes]);

  return (
    <>
      <div
        onClick={e => {
          if (!roundDetails?.house.address) return;
          dispatch(setActiveRound(round));
          if (cmdPlusClicked(e)) {
            openInNewTab(`${window.location.href}/${roundDetails.house.address}/${round.address}`);
            return;
          }
          navigate(`../${roundDetails.house.address}/${round.address}`);
        }}
      >
        <Card
          bgColor={CardBgColor.White}
          borderRadius={CardBorderRadius.twenty}
          classNames={clsx(roundCompleted(round) && classes.roundEnded, classes.roundCard)}
        >
          <div className={classes.textContainer}>
            <div className={classes.topContainer}>
              <div className={classes.leftContainer}>
                {roundDetails?.house && (
                  <>
                    <img src={roundDetails?.house.imageURI} alt="community profile" />
                    <div>{roundDetails.house.name}</div>
                  </>
                )}
              </div>
              <StatusPill status={round.state} />
            </div>
            <div className={classes.authorContainer}>{round.title}</div>
          </div>
          {/* 
          <div className={classes.roundInfo}>
            <div className={clsx(classes.section, classes.funding)}>
              <p className={classes.title}>{t('funding')}</p>
              <p className={classes.info}>
                <span className="">
                  <TruncateThousands amount={round.fundingAmount} decimals={2} />
                  {` ${round.currencyType}`}
                </span>
                {isTimedAuction(round) && (
                  <>
                    <span className={classes.xDivide}>{' × '}</span>
                    <span className="">{round.config.winnerCount}</span>
                  </>
                )}
              </p>
            </div>

            <div className={classes.divider}></div>

            <div className={classes.section}>
              <Tooltip
                content={
                  <>
                    <p className={classes.title}>
                      {isInfAuction(round) ? 'Quorum' : deadlineCopy(round)}
                    </p>
                    <p className={classes.info}>
                      {isInfAuction(round)
                        ? `${round.quorum * 100}%`
                        : diffTime(deadlineTime(round)).replace('months', 'mos')}{' '}
                    </p>
                  </>
                }
                tooltipContent={
                  isInfAuction(round)
                    ? `The % of votes required for a prop to be funded`
                    : `${dayjs(deadlineTime(round)).tz().format('MMMM D, YYYY h:mm A z')}`
                }
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
              round.state === RoundState.IN_VOTING_PERIOD
                ? classes.voting
                : round.state === RoundState.IN_PROPOSING_PERIOD
                ? classes.proposing
                : classes.notStartedOrEnded,
            )}
          >
            {round.state === RoundState.NOT_STARTED ? (
              <Countdown date={getDateFromTimestamp(round.config.proposalPeriodStartTimestamp)} />
            ) : (
              statusCopy
            )}
          </div> */}
        </Card>
      </div>
    </>
  );
};

export default StatusRoundCard;
