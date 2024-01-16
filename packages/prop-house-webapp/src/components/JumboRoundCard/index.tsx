import classes from './JumboRoundCard.module.css';
import {
  House,
  Proposal,
  Round,
  Timed,
  usePropHouse,
  Proposal_Order_By,
} from '@prophouse/sdk-react';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { IoTime } from 'react-icons/io5';
import { FaClipboardCheck } from 'react-icons/fa';
import { HiTrophy } from 'react-icons/hi2';
import RoundStatusPill from '../RoundStatusPill';
import ProposalRankings from '../ProposalRankings';
import ProposedSummary from '../ProposedSummary';
import { trophyColors } from '../../utils/trophyColors';
import { buildImageURL } from '../../utils/buildImageURL';
import { isMobile } from 'web3modal';
import RoundAwardsDisplay from '../RoundAwardsDisplay';
import dayjs from 'dayjs';
import { BigNumber } from 'ethers';
import clsx from 'clsx';
import Button, { ButtonColor } from '../Button';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { openInNewTab } from '../../utils/openInNewTab';
import { useContentModeration } from '../../hooks/useContentModeration';
import { useIsHiddenRound } from '../../hooks/useIsHiddenRound';
import JumboCardLoading from '../JumboCardLoading';
import Skeleton from 'react-loading-skeleton';

const JumboRoundCard: React.FC<{
  round: Round;
  house: House;
  displayHorizontal?: boolean;
  onClick?: () => void;
}> = props => {
  const { round, house, displayHorizontal, onClick } = props;

  let navigate = useNavigate();
  const propHouse = usePropHouse();
  const [numProps, setNumProps] = useState<number | undefined>();
  const [numVotes, setNumVotes] = useState<number>();
  const [topThreeProps, setTopThreeProps] = useState<Proposal[]>();
  const [proposals, setProposals] = useState<Proposal[]>();
  const [fetchingTop3Props, setFetchingTop3Props] = useState(false);
  // eslint-disable-next-line
  const { isMod, hideProp, hideRound } = useContentModeration(house);
  const { isHidden, refresh } = useIsHiddenRound(round.address);

  const showAwards =
    round.state === Timed.RoundState.NOT_STARTED ||
    round.state === Timed.RoundState.IN_PROPOSING_PERIOD;
  const proposing = round.state === Timed.RoundState.IN_PROPOSING_PERIOD;
  const voting = round.state === Timed.RoundState.IN_VOTING_PERIOD;
  const notStarted = round.state === Timed.RoundState.NOT_STARTED;
  const ended =
    round.state === Timed.RoundState.IN_CLAIMING_PERIOD ||
    round.state === Timed.RoundState.COMPLETE;
  const showRankings = round.state >= Timed.RoundState.IN_VOTING_PERIOD;
  const timestampToUse = notStarted
    ? round.config.proposalPeriodStartTimestamp
    : proposing
    ? round.config.proposalPeriodEndTimestamp
    : round.config.votePeriodEndTimestamp;

  useEffect(() => {
    refresh();
  }, [round.address, refresh]);

  useEffect(() => {
    if (numVotes && (!voting || !ended)) return;
    const fetchVotes = async () => {
      try {
        const voteCount = await propHouse.query.getRoundVoteCount(round.address);
        setNumVotes(BigNumber.from(voteCount).toNumber());
      } catch (e) {
        console.log(e);
      }
    };
    fetchVotes();
  });

  useEffect(() => {
    if (numProps || !proposing) return;
    const fetchProps = async () => {
      try {
        setNumProps(await propHouse.query.getRoundProposalCount(round.address));
      } catch (e) {
        console.log(e);
      }
    };
    fetchProps();
  });

  useEffect(() => {
    if (topThreeProps || !showRankings) return;
    const fetchTopThreeProps = async () => {
      try {
        setFetchingTop3Props(true);
        const props = await propHouse.query.getProposalsForRound(round.address, {
          page: 1,
          perPage: 3,
          orderBy: Proposal_Order_By.VotingPower,
          where: { isCancelled: false },
        });
        setFetchingTop3Props(false);
        setTopThreeProps(props);
      } catch (e) {
        setFetchingTop3Props(false);
        console.log(e);
      }
    };
    fetchTopThreeProps();
  });

  useEffect(() => {
    if (proposals) return;
    const fetchProposals = async () => {
      try {
        const props = await propHouse.query.getProposalsForRound(round.address, {
          where: { isCancelled: false },
        });
        setProposals(props);
      } catch (e) {
        console.log(e);
      }
    };
    fetchProposals();
  });

  return isHidden === undefined ? (
    <JumboCardLoading />
  ) : isHidden ? (
    <></>
  ) : (
    <div
      onClick={
        onClick
          ? onClick
          : e => {
              if (cmdPlusClicked(e)) {
                openInNewTab(`/${round.address}`);
                return;
              }
              navigate(`/${round.address}`);
            }
      }
    >
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={clsx(classes.roundCard, displayHorizontal && classes.displayHorizontal)}
        onHoverEffect={false}
      >
        <Row className={classes.container}>
          <Col className={classes.leftCol} md={displayHorizontal ? 6 : 12}>
            <div className={classes.headerContainer}>
              <div className={classes.roundCreatorAndTitle}>
                <div className={classes.roundCreator}>
                  <img src={buildImageURL(house.imageURI)} alt="house profile" />
                  {house.name}
                  {isMod && (
                    <Button
                      bgColor={ButtonColor.Gray}
                      onClick={e => {
                        e.stopPropagation();
                        hideRound(round.address);
                        setTimeout(() => refresh(), 1000);
                      }}
                      text="Hide"
                      classNames={classes.hideButton}
                    />
                  )}
                </div>
                <div className={classes.roundTitle}>
                  {round.title[0].toUpperCase() + round.title.slice(1)}
                </div>
              </div>
              {isMobile() && <RoundStatusPill round={round} />}
            </div>
            <div
              className={clsx(
                classes.statusItemContainer,
                displayHorizontal && classes.displayHorizontal,
              )}
            >
              {!isMobile() && (
                <div className={classes.item}>
                  <div className={classes.title}>
                    <FaClipboardCheck /> Status
                  </div>
                  <div className={classes.content}>
                    <RoundStatusPill round={round} />
                  </div>
                </div>
              )}

              <>
                <div className={classes.item}>
                  <div className={classes.title}>
                    <IoTime />
                    {notStarted ? 'Starts' : proposing || voting ? 'Deadline' : 'Ended'}
                  </div>
                  <div className={classes.content}>
                    {dayjs(timestampToUse * 1000).format('MMM, D hh:mm a')}
                  </div>
                </div>
              </>
            </div>
          </Col>

          <Col
            className={clsx(classes.rightCol, displayHorizontal && classes.displayHorizontal)}
            md={displayHorizontal ? 6 : 12}
          >
            <div>
              {showAwards && (
                <div className={classes.awardsContainer}>
                  <div className={classes.title}>
                    <HiTrophy size={14} color={trophyColors('second')} />
                    Awards
                  </div>
                  <RoundAwardsDisplay
                    round={round}
                    breakout={false}
                    hidePlace={true}
                    slidesOffsetAfter={0}
                    slidesOffsetBefore={0}
                    showNav={!isMobile()}
                  />
                </div>
              )}

              {showRankings && (
                <>
                  {fetchingTop3Props ? (
                    <>
                      <Skeleton height={30} />
                      <Skeleton height={60} />
                    </>
                  ) : (
                    topThreeProps && (
                      <ProposalRankings
                        proposals={topThreeProps}
                        round={round}
                        areWinners={ended}
                      />
                    )
                  )}
                </>
              )}
            </div>

            <div>
              {proposals && (proposing || voting) && (
                <ProposedSummary proposers={proposals.map(p => p.proposer)} />
              )}
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default JumboRoundCard;
