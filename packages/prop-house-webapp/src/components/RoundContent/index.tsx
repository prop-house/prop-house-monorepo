import classes from './RoundContent.module.css';
import { useState } from 'react';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import { Row, Col } from 'react-bootstrap';
import { House, Proposal, Round, RoundType, Timed } from '@prophouse/sdk-react';
import TimedRoundProposalCard from '../TimedRoundProposalCard';
import TimedRoundModules from '../TimedRoundModules';
import InfRoundModules from '../InfRoundModules';
import { useHiddenPropIds } from '../../hooks/useHiddenPropIds';
import { useContentModeration } from '../../hooks/useContentModeration';

const RoundContent: React.FC<{
  round: Round;
  house: House;
  proposals: Proposal[];
}> = props => {
  const { round, proposals, house } = props;

  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const { hiddenPropIds, refresh } = useHiddenPropIds(round.address);
  // eslint-disable-next-line
  const { isMod, hideProp, hideRound } = useContentModeration(house);

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
              {hiddenPropIds !== undefined &&
                proposals
                  .filter(p => !hiddenPropIds.includes(p.id))
                  .map((prop, index) => (
                    <Col key={index}>
                      <TimedRoundProposalCard
                        proposal={prop}
                        round={round}
                        mod={isMod}
                        hideProp={async (propId: number) => {
                          await hideProp(round.address, propId);
                          setTimeout(() => refresh(), 1000);
                        }}
                      />
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
