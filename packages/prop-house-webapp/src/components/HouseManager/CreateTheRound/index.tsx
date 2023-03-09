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
// import InstructionBox from '../InstructionBox';
import StrategyCard from '../StrategyCard';
import Text from '../Text';
import { useDispatch } from 'react-redux';
import Modal from '../../Modal';
import Button, { ButtonColor } from '../../Button';
import { isRoundStepValid } from '../utils/isRoundStepValid';
import RoundDatesSelector from '../RoundDatesSelector';
import VotingStrategies from '../VotingStrategies';
import AwardsSelector from '../AwardsSelector';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { ForceOpenInNewTab } from '../../ForceOpenInNewTab';
import EditNameDescriptionModal from '../EditNameDescriptionModal';

const CreateTheRound = () => {
  const round = useAppSelector(state => state.round.round);
  const addresses = [...round.votingContracts, ...round.votingUsers];
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkStepCriteria());
  }, [dispatch, round]);

  const [editDatesModal, setShowEditDatesModal] = useState(false);
  const [editNameModal, setShowEditNameModal] = useState(false);
  const [editVotesModal, setShowVotesModal] = useState(false);
  const [editAwardsModal, setShowAwardsModal] = useState(false);

  const handleDateSave = () => {
    // TODO: since we save onChange here, we don't need to save on the modal save button
    // TODO: but that also means the user can save invalid data, which will disable the Create button
    // TODO: but the user won't know why, so we need to do some error handling
    console.log('save changes', round.title, round.description);
    setShowEditDatesModal(false);
  };
  const handleVotesSave = () => {
    // TODO: since we save onChange here, we don't need to save on the modal save button
    // TODO: but that also means the user can save invalid data, which will disable the Create button
    // TODO: but the user won't know why, so we need to do some error handling
    console.log('save changes', round.title, round.description);
    setShowVotesModal(false);
  };
  const handleAwardsSave = () => {
    // TODO: since we save onChange here, we don't need to save on the modal save button
    // TODO: but that also means the user can save invalid data, which will disable the Create button
    // TODO: but the user won't know why, so we need to do some error handling
    console.log('save changes', round.title, round.description);
    setShowAwardsModal(false);
  };

  return (
    <>
      {editDatesModal && (
        <Modal
          title="Edit round timing"
          subtitle=""
          body={<RoundDatesSelector />}
          setShowModal={setShowEditDatesModal}
          button={
            <Button
              text={'Cancel'}
              bgColor={ButtonColor.Black}
              onClick={() => setShowEditDatesModal(false)}
            />
          }
          secondButton={
            <Button
              text={'Save Changes'}
              bgColor={ButtonColor.Pink}
              onClick={handleDateSave}
              disabled={!isRoundStepValid(round, 4)}
            />
          }
        />
      )}
      {editNameModal && <EditNameDescriptionModal setShowEditNameModal={setShowEditNameModal} />}
      {editVotesModal && (
        <Modal
          title="Edit voting strategies"
          subtitle=""
          body={<VotingStrategies />}
          setShowModal={setShowVotesModal}
          button={
            <Button
              text={'Cancel'}
              bgColor={ButtonColor.Black}
              onClick={() => setShowVotesModal(false)}
            />
          }
          secondButton={
            <Button
              text={'Save Changes'}
              bgColor={ButtonColor.Pink}
              onClick={handleVotesSave}
              disabled={!isRoundStepValid(round, 2)}
            />
          }
        />
      )}
      {editAwardsModal && (
        <Modal
          title="Edit awards"
          subtitle=""
          body={<AwardsSelector />}
          setShowModal={setShowAwardsModal}
          button={
            <Button
              text={'Cancel'}
              bgColor={ButtonColor.Black}
              onClick={() => setShowAwardsModal(false)}
            />
          }
          secondButton={
            <Button
              text={'Save Changes'}
              bgColor={ButtonColor.Pink}
              onClick={handleAwardsSave}
              disabled={!isRoundStepValid(round, 3)}
            />
          }
        />
      )}

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
        <EditSection section="votes" onClick={() => setShowVotesModal(true)} />
        <CardWrapper>
          {addresses.map(a => (
            <StrategyCard address={a} />
          ))}
        </CardWrapper>
      </Group>

      <Divider />

      <Group gap={16}>
        <EditSection section="awards" onClick={() => setShowAwardsModal(true)} />
        <CardWrapper>
          {[...Array(round.numWinners)].map((award, idx) => (
            // TODO: changed fundingAmount because now we're using the amount from the award
            <AwardCard amount={2} award={round.awards[0]} place={idx + 1} />
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
