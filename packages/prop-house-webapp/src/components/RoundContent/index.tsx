import classes from './RoundContent.module.css';
import { useState } from 'react';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import { Row, Col } from 'react-bootstrap';
import { Proposal, Round, RoundType, Timed } from '@prophouse/sdk-react';
import TimedRoundProposalCard from '../TimedRoundProposalCard';
import TimedRoundModules from '../TimedRoundModules';
import InfRoundModules from '../InfRoundModules';

const RoundContent: React.FC<{
  round: Round;
  proposals: Proposal[];
}> = props => {
  const { round, proposals } = props;

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);

  return (
    <>
      {showVoteConfirmationModal && (
        <VoteConfirmationModal
          round={round}
          setShowVoteConfirmationModal={setShowVoteConfirmationModal}
        />
      )}

      <Row className={classes.propCardsRow}>
        <Col xl={8} className={classes.propCardsCol}>
          {round.state === Timed.RoundState.UNKNOWN ? (
            <ErrorMessageCard message={'Error determining the state of the round'} />
          ) : round.state === Timed.RoundState.CANCELLED ? (
            <ErrorMessageCard message={'Round was cancelled'} />
          ) : round.state === Timed.RoundState.NOT_STARTED ? (
            <ErrorMessageCard
              message={'Round starting soon'}
              date={new Date(round.config.proposalPeriodStartTimestamp * 1000)}
            />
          ) : proposals.length === 0 ? (
            <ErrorMessageCard message={'Submitted proposals will show up here'} />
          ) : (
            <>
              {proposals.map((prop, index) => (
                <Col key={index}>
                  <TimedRoundProposalCard proposal={prop} round={round} isWinner={prop.isWinner} />
                </Col>
              ))}
            </>
          )}
        </Col>
        {round.type === RoundType.TIMED ? (
          <TimedRoundModules
            round={round}
            proposals={proposals}
            setShowVotingModal={setShowVoteConfirmationModal}
          />
        ) : (
          <InfRoundModules
            round={round}
            proposals={proposals}
            setShowVotingModal={setShowVoteConfirmationModal}
          />
        )}
      </Row>
    </>
  );
};

export default RoundContent;
