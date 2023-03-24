import classes from './CreateTheRound.module.css';
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
import StrategyCard from '../StrategyCard';
import Text from '../Text';
import { useDispatch } from 'react-redux';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { ForceOpenInNewTab } from '../../ForceOpenInNewTab';
import { VotingStrategyInfo, VotingStrategyType } from '@prophouse/sdk/dist/types';
import EditNameDescriptionModal from '../EditNameDescriptionModal';
import EditDatesModal from '../EditDatesModal';
import VotingStrategyModal from '../VotingStrategyModal';
import EditAwardsModal from '../EditAwardsModal';

const CreateTheRound = () => {
  const round = useAppSelector(state => state.round.round);
  const [strategies, setStrategies] = useState<VotingStrategyInfo[]>(
    round.strategies.length ? round.strategies : [],
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkStepCriteria());
  }, [dispatch, round]);

  const [editDatesModal, setShowEditDatesModal] = useState(false);
  const [editNameModal, setShowEditNameModal] = useState(false);
  const [editStrategiesModal, setShowStrategiesModal] = useState(false);
  const [editAwardsModal, setShowAwardsModal] = useState(false);

  return (
    <>
      {editDatesModal && <EditDatesModal setShowEditDatesModal={setShowEditDatesModal} />}
      {editNameModal && <EditNameDescriptionModal setShowEditNameModal={setShowEditNameModal} />}
      {editStrategiesModal && (
        <VotingStrategyModal
          editMode
          strategies={strategies}
          setStrategies={setStrategies}
          setShowVotingStrategyModal={setShowStrategiesModal}
        />
      )}
      {editAwardsModal && <EditAwardsModal setShowAwardsModal={setShowAwardsModal} />}

      <Group row gap={10}>
        <DeadlineDates round={round} />
        <EditSection onClick={() => setShowEditDatesModal(true)} />
      </Group>

      <Group gap={6} mb={-10}>
        <Group row classNames={classes.titleAndEditIcon}>
          <Text type="heading">{round.title}</Text>
          <EditSection onClick={() => setShowEditNameModal(true)} />
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
                {sanitizeHtml(round.description, {
                  allowedAttributes: {
                    a: ['href', 'target'],
                  },
                })}
              </Markdown>
            </Text>
          }
        />
      </Group>

      <Divider narrow />

      <Group gap={16}>
        <EditSection section="votes" onClick={() => setShowStrategiesModal(true)} />
        <CardWrapper>
          {strategies.map((s, idx) =>
            s.strategyType === VotingStrategyType.VANILLA ? (
              <></>
            ) : s.strategyType === VotingStrategyType.WHITELIST ? (
              s.members.map((m, idx) => (
                <StrategyCard
                  key={idx}
                  type={s.strategyType}
                  address={m.address}
                  multiplier={Number(m.votingPower)}
                />
              ))
            ) : (
              <StrategyCard
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
          {/* // if there's one award that means all the numWinners get the same award
            // if there's more than one award, then each award is for a different place */}

          {[...Array(round.numWinners)].map((_, idx) => (
            <AwardCard award={round.awards[round.awards.length === 1 ? 0 : idx]} place={idx + 1} />
          ))}
        </CardWrapper>
      </Group>

      {/* // TODO: add this back in when we have the tokens and NFTs sections */}
      {/*
      <Divider />
       <Group gap={16} mb={16}>
        <Text type="title">Deposit funds for the round</Text>
        <InstructionBox
          title="Funding now vs later"
          text="You can add either contract addresses allowing anyone that holds the relevant ERC20/ERC721 to participate, or add any specific wallet addresses for individual access to the round."
        />
      </Group>

       <Group>
        <Text type="title">Tokens</Text>
      </Group>

      <Divider />

      <Group>
        <Text type="title">NFTs</Text>
      </Group> */}

      <Footer />
    </>
  );
};

export default CreateTheRound;
