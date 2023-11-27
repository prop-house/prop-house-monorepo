import classes from './TimedRoundModules.module.css';
import { Col } from 'react-bootstrap';
import clsx from 'clsx';
import TimedRoundAcceptingPropsModule from '../TimedRoundAcceptingPropsModule';
import TimedRoundVotingModule from '../TimedRoundVotingModule';
import RoundOverModule from '../RoundOverModule';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import { isMobile } from 'web3modal';
import RoundModuleNotStarted from '../RoundModuleNotStarted';
import { Proposal, Round, Timed, usePropHouse } from '@prophouse/sdk-react';
import RoundModuleCancelled from '../RoundModuleCancelled';
import RoundModuleUnknownState from '../RoundModuleUnknownState';
import dayjs from 'dayjs';
import Button, { ButtonColor } from '../Button';
import { FaEdit } from 'react-icons/fa';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';

const TimedRoundModules: React.FC<{
  round: Round;
  proposals: Proposal[];
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { round, proposals, setShowVotingModal } = props;

  const totalVotesAcrossAllProps = proposals.reduce(
    (total, prop) => (total = total + Number(prop.votingPower)),
    0,
  );

  const { address: account } = useAccount();
  const [isRoundManager, setIsRoundManager] = useState<boolean>();
  const propHouse = usePropHouse();
  const navigate = useNavigate();

  useEffect(() => {
    if (!account) return;
    const fetchIsRoundManager = async () => {
      const rounds = await propHouse.query.getRoundsManagedByAccount(account);
      setIsRoundManager(rounds.some(r => r.address === round.address));
    };
    fetchIsRoundManager();
  });

  const roundStateUnknown = round.state === Timed.RoundState.UNKNOWN && <RoundModuleUnknownState />;

  const roundCancelled = round.state === Timed.RoundState.CANCELLED && <RoundModuleCancelled />;

  const notStartedModule = round.state === Timed.RoundState.NOT_STARTED && (
    <RoundModuleNotStarted round={round} />
  );

  const acceptingPropsModule = round.state === Timed.RoundState.IN_PROPOSING_PERIOD && (
    <TimedRoundAcceptingPropsModule round={round} />
  );

  const timedRoundVotingModule = round.state === Timed.RoundState.IN_VOTING_PERIOD && (
    <TimedRoundVotingModule
      round={round}
      setShowVotingModal={setShowVotingModal}
      totalVotes={totalVotesAcrossAllProps}
    />
  );

  const roundOverModule = round.state > Timed.RoundState.IN_VOTING_PERIOD && (
    <RoundOverModule numOfProposals={proposals.length} totalVotes={totalVotesAcrossAllProps} />
  );

  const timeline = round.state <= Timed.RoundState.IN_VOTING_PERIOD && (
    <div className={classes.timelineContainer}>
      <div>
        <span>Proposal deadline</span>
        <span>{dayjs(round.config.proposalPeriodEndTimestamp * 1000).format('MMM D @ h:mmA')}</span>
      </div>
      <div>
        <span>Voting deadline</span>
        <span>{dayjs(round.config.votePeriodEndTimestamp * 1000).format('MMM D @ h:mmA')}</span>
      </div>
    </div>
  );

  const manageRoundBtn = isRoundManager && (
    <Button
      text={
        <>
          Manage Round <FaEdit />
        </>
      }
      bgColor={ButtonColor.White}
      classNames={classes.manageRoundBtn}
      onClick={() => navigate(`/manage/${round.address}`)}
    />
  );

  const modules = [
    manageRoundBtn,
    timeline,
    roundStateUnknown,
    roundCancelled,
    notStartedModule,
    acceptingPropsModule,
    timedRoundVotingModule,
    roundOverModule,
  ];

  return (
    <Col xl={4} className={clsx(classes.sideCards, classes.breakOut)}>
      {isMobile() ? (
        <Swiper slidesPerView={1} className={classes.swiper}>
          {modules.map(
            (module, index) =>
              React.isValidElement(module) && (
                <SwiperSlide style={{ paddingLeft: '24px', paddingRight: '24px' }} key={index}>
                  {module}
                </SwiperSlide>
              ),
          )}
        </Swiper>
      ) : (
        modules.map((m, i) => <div key={i}>{m}</div>)
      )}
    </Col>
  );
};
export default TimedRoundModules;
