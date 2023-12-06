import classes from './RoundContent.module.css';
import { useEffect, useState } from 'react';
import ErrorMessageCard from '../ErrorMessageCard';
import VoteConfirmationModal from '../VoteConfirmationModal';
import { Row, Col } from 'react-bootstrap';
import { House, Round, RoundType, Timed } from '@prophouse/sdk-react';
import TimedRoundProposalCard from '../TimedRoundProposalCard';
import TimedRoundModules from '../TimedRoundModules';
import InfRoundModules from '../InfRoundModules';
import { ProposalWithTldr } from '../../types/ProposalWithTldr';
import { useAccount } from 'wagmi';
import { getHiddenPropIds, getIsMod, hideProp } from '../../utils/supabaseModeration';

const RoundContent: React.FC<{
  round: Round;
  house: House;
  proposals: ProposalWithTldr[];
}> = props => {
  const { round, proposals, house } = props;

  const { address: account } = useAccount();
  const [showVoteConfirmationModal, setShowVoteConfirmationModal] = useState(false);
  const [hiddenPropIds, setHiddenPropIds] = useState<number[] | undefined>();
  const [refreshHiddenProps, setRefreshHiddenProps] = useState<boolean>(true);

  const [isMod, setIsMod] = useState<boolean>();

  useEffect(() => {
    if (!account) return;
    const fetchModData = async () => {
      setIsMod(await getIsMod(house.address, account));
    };
    fetchModData();
  }, [account, house.address]);

  useEffect(() => {
    if (!account || !refreshHiddenProps) return;
    const fetchHiddenPropIds = async () => {
      setRefreshHiddenProps(false);
      setHiddenPropIds(await getHiddenPropIds(round.address));
    };
    fetchHiddenPropIds();
  }, [hiddenPropIds, account, round.address, house.address, refreshHiddenProps]);

  const _hideProp = async (propId: number) => {
    await hideProp(round.address, propId);
    setRefreshHiddenProps(true);
  };

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
                        hideProp={_hideProp}
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
