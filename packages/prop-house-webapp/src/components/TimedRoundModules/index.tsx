import classes from './TimedRoundModules.module.css';
import { Col } from 'react-bootstrap';
import TimedRoundAcceptingPropsModule from '../TimedRoundAcceptingPropsModule';
import TimedRoundVotingModule from '../TimedRoundVotingModule';
import RoundOverModule from '../RoundOverModule';
import React, { Dispatch, SetStateAction } from 'react';
import RoundModuleNotStarted from '../RoundModuleNotStarted';
import { Proposal, Round, Timed } from '@prophouse/sdk-react';
import RoundModuleCancelled from '../RoundModuleCancelled';
import RoundModuleUnknownState from '../RoundModuleUnknownState';
import dayjs from 'dayjs';

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

  const modules = [
    timeline,
    roundStateUnknown,
    roundCancelled,
    notStartedModule,
    acceptingPropsModule,
    timedRoundVotingModule,
    roundOverModule,
  ];

  return (
    <Col xl={4} className={classes.sideCards}>
      {modules.map((m, i) => (
        <div key={i}>{m}</div>
      ))}
    </Col>
  );
};
export default TimedRoundModules;
