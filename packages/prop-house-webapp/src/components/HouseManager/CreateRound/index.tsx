import classes from './CreateRound.module.css';
import { useEffect, useState } from 'react';
import { useAppSelector } from '../../../hooks';
import { checkStepCriteria } from '../../../state/slices/round';
import DeadlineDates from '../../DeadlineDates';
import Divider from '../../Divider';
import ReadMore from '../../ReadMore';
import AwardCard from '../AwardCard';
import CardWrapper from '../CardWrapper';
import EditSection from '../EditSection';
import Footer from '../Footer';
import Group from '../Group';
import VoterCard from '../VoterCard';
import Text from '../Text';
import { useDispatch } from 'react-redux';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { ForceOpenInNewTab } from '../../ForceOpenInNewTab';
import { VotingStrategyConfig, VotingStrategyType } from '@prophouse/sdk-react';
import { getDateFromTimestamp } from '../utils/getDateFromTimestamp';
import { getDateFromDuration } from '../utils/getDateFromDuration';
import EditRoundInfoModal from '../EditRoundInfoModal';
import EditDatesModal from '../EditDatesModal';
import VotersModal from '../VotersModal';
import EditAwardsModal from '../EditAwardsModal';

/**
 * @overview
 * Step 6 where the user can review the round information and edit it if needed. House info is not editable here.
 * TODO - add House name & image up top (see Figma)
 *
 * @component
 * @name DeadlineDates - the start and end dates of the round
 * @name EditSection - the edit icon that opens the modal to edit the section
 * @name CardWrapper -formats the voter & award cards into a grid
 *
 * @notes
 * @see startDate - the start date of the round
 * @see endDate - the voting end date of the round
 */

const CreateRound = () => {
  const round = useAppSelector(state => state.round.round);
  const [voters, setVoters] = useState<VotingStrategyConfig[]>(
    round.voters.length ? round.voters : [],
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkStepCriteria());
  }, [dispatch, round]);

  const [editDatesModal, setShowEditDatesModal] = useState(false);
  const [editRoundInfoModal, setShowEditRoundInfoModal] = useState(false);
  const [editVotersModal, setShowVotersModal] = useState(false);
  const [editAwardsModal, setShowAwardsModal] = useState(false);

  const startDate = getDateFromTimestamp(round.proposalPeriodStartUnixTimestamp);
  const endDate = getDateFromDuration(
    startDate,
    round.proposalPeriodDurationSecs + round.votePeriodDurationSecs,
  );

  return (
    <>
      {editDatesModal && <EditDatesModal setShowEditDatesModal={setShowEditDatesModal} />}
      {editRoundInfoModal && (
        <EditRoundInfoModal setShowEditRoundInfoModal={setShowEditRoundInfoModal} />
      )}
      {editVotersModal && (
        <VotersModal
          editMode
          voters={voters}
          setVoters={setVoters}
          setShowVotersModal={setShowVotersModal}
        />
      )}
      {editAwardsModal && <EditAwardsModal setShowAwardsModal={setShowAwardsModal} />}

      <Group row gap={10}>
        <DeadlineDates start={startDate} end={endDate} />
        <EditSection onClick={() => setShowEditDatesModal(true)} />
      </Group>

      <Group gap={6} mb={-10}>
        <Group row classNames={classes.titleAndEditIcon} gap={10}>
          <Text type="heading">{round.title}</Text>
          <EditSection onClick={() => setShowEditRoundInfoModal(true)} />
        </Group>

        <ReadMore
          description={
            <Text type="body">
              <Markdown
                options={{
                  overrides: {
                    a: {
                      component: ForceOpenInNewTab,
                      props: {
                        target: '_blank',
                        rel: 'noreferrer',
                      },
                    },
                  },
                }}
              >
                {sanitizeHtml(round.description, { allowedAttributes: { a: ['href', 'target'] } })}
              </Markdown>
            </Text>
          }
        />
      </Group>

      <Divider />

      <Group gap={16}>
        <EditSection section="votes" onClick={() => setShowVotersModal(true)} />
        <CardWrapper>
          {voters.map((s, idx) =>
            s.strategyType === VotingStrategyType.VANILLA ? (
              <></>
            ) : s.strategyType === VotingStrategyType.WHITELIST ? (
              // with whitelist, we need to show a card for each member
              // TODO - add truncate to number of cards (see Figma)
              s.members.map((m, idx) => (
                <VoterCard
                  key={idx}
                  type={s.strategyType}
                  address={m.address}
                  multiplier={Number(m.votingPower)}
                />
              ))
            ) : (
              <VoterCard
                key={idx}
                type={s.strategyType}
                address={s.address}
                multiplier={s.multiplier}
              />
            ),
          )}
        </CardWrapper>
      </Group>

      <Divider />

      <Group gap={16}>
        <EditSection section="awards" onClick={() => setShowAwardsModal(true)} />
        <CardWrapper>
          {/* this creates an array of the correct length to map over based on the number of winners
          if there is only one winner, we want to show the same award card for all winners (e.g. awards[0]), 
          otherwise we want to show the award card for each winner (e.g. awards[idx])
           */}
          {[...Array(round.numWinners)].map((_, idx) => (
            <AwardCard award={round.awards[round.awards.length === 1 ? 0 : idx]} place={idx + 1} />
          ))}
        </CardWrapper>
      </Group>

      <Footer />
    </>
  );
};

export default CreateRound;
