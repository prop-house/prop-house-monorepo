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
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useDispatch } from 'react-redux';
import { ForceOpenInNewTab } from '../../ForceOpenInNewTab';
import { VotingStrategyType } from '@prophouse/sdk-react';
import { getDateFromTimestamp } from '../../../utils/getDateFromTimestamp';
import { getDateFromDuration } from '../../../utils/getDateFromDuration';
import OverflowScroll from '../OverflowScroll';
import EditRoundInfoModal from '../EditRoundInfoModal';
import EditDatesModal from '../EditDatesModal';
import EditAwardsModal from '../EditAwardsModal';
import EditVotersModal from '../EditVotersModal';

/**
 * @overview
 * Step 6 where the user can review the round information and edit it if needed. House info is not editable here.
 *
 * @component
 * @name DeadlineDates - the start and end dates of the round
 * @name EditSection - the edit icon that opens the modal to edit the section
 * @name CardWrapper - formats the voter & award cards into a grid
 * @name OverflowScroll - wrapper that allows children to scroll vertically
 *
 * @notes
 * @see startDate - the start date of the round
 * @see endDate - the voting end date of the round
 */

const CreateRound = () => {
  const round = useAppSelector(state => state.round.round);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkStepCriteria());
  }, [dispatch, round]);

  const [editDatesModal, setShowDatesModal] = useState(false);
  const [editRoundInfoModal, setShowRoundInfoModal] = useState(false);
  const [editVotersModal, setShowVotersModal] = useState(false);
  const [editAwardsModal, setShowAwardsModal] = useState(false);

  const startDate = getDateFromTimestamp(round.proposalPeriodStartUnixTimestamp);
  const endDate = getDateFromDuration(
    startDate,
    round.proposalPeriodDurationSecs + round.votePeriodDurationSecs,
  );

  return (
    <>
      {editDatesModal && <EditDatesModal setShowDatesModal={setShowDatesModal} />}
      {editRoundInfoModal && <EditRoundInfoModal setShowRoundInfoModal={setShowRoundInfoModal} />}
      {editVotersModal && <EditVotersModal setShowVotersModal={setShowVotersModal} />}
      {editAwardsModal && <EditAwardsModal setShowAwardsModal={setShowAwardsModal} />}

      <Group row gap={10}>
        <DeadlineDates start={startDate} end={endDate} />
        <EditSection onClick={() => setShowDatesModal(true)} />
      </Group>

      <Group gap={6} mb={-10}>
        <Group row classNames={classes.titleAndEditIcon} gap={10}>
          <Text type="heading">{round.title}</Text>
          <EditSection onClick={() => setShowRoundInfoModal(true)} />
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
        <EditSection section="voters" onClick={() => setShowVotersModal(true)} />
        <OverflowScroll>
          <CardWrapper>
            {round.voters.map((s, idx) =>
              s.strategyType === VotingStrategyType.VANILLA ? (
                <></>
              ) : s.strategyType === VotingStrategyType.ALLOWLIST ? (
                // with whitelist, we need to show a card for each member
                s.members.map((m, idx) => (
                  <VoterCard
                    key={idx}
                    type={s.strategyType}
                    address={m.address}
                    multiplier={Number(m.govPower)}
                  />
                ))
              ) : s.strategyType === VotingStrategyType.BALANCE_OF_ERC1155 ? (
                <VoterCard
                  key={idx}
                  type={s.strategyType}
                  tokenId={s.tokenId}
                  address={s.address}
                  multiplier={s.multiplier}
                />
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
        </OverflowScroll>
      </Group>

      <Divider />

      <Group gap={16}>
        <EditSection section="awards" onClick={() => setShowAwardsModal(true)} />
        <OverflowScroll>
          <CardWrapper>
            {/* this creates an array of the correct length to map over based on the number of winners
          if there is only one winner, we want to show the same award card for all winners (e.g. awards[0]), 
          otherwise we want to show the award card for each winner (e.g. awards[idx])
           */}
            {[...Array(round.numWinners)].map((_, idx) => (
              <AwardCard
                key={idx}
                award={round.awards[round.awards.length === 1 ? 0 : idx]}
                place={idx + 1}
              />
            ))}
          </CardWrapper>
        </OverflowScroll>
      </Group>

      <Divider />

      <Footer />
    </>
  );
};

export default CreateRound;
