import React, { Dispatch, SetStateAction, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Modal from '../../Modal';
import { useAppSelector } from '../../../hooks';
import { useDispatch } from 'react-redux';
import { saveRound } from '../../../state/thunks';
import VotersModal from '../VotersModal';
import { DefaultVotingConfigs, VotingStrategyType } from '@prophouse/sdk-react';
import OverflowScroll from '../OverflowScroll';
import Group from '../Group';
import Voter from '../Voter';
import { hasVoterListChanged } from '../../../utils/hasVoterListChanged';

const EditVotersModal: React.FC<{
  setShowVotersModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowVotersModal } = props;

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const [editedVoters, setEditedVoters] = useState<DefaultVotingConfigs[]>(round.voters);
  const [isAddingVoter, setIsAddingVoter] = useState(false);

  const handleEditVotersSave = () => {
    setEditedVoters(editedVoters);
    dispatch(saveRound({ ...round, voters: editedVoters }));
    setShowVotersModal(false);
  };

  const handleRemoveVoter = (address: string, type: string) => {
    if (type === VotingStrategyType.VANILLA) return;

    let updatedVoters: DefaultVotingConfigs[] = [...editedVoters];

    if (type === VotingStrategyType.WHITELIST) {
      // Find existing Whitelist strategy
      const existingStrategyIndex = editedVoters.findIndex(
        existingStrategy => existingStrategy.strategyType === VotingStrategyType.WHITELIST,
      );

      if (existingStrategyIndex > -1) {
        const existingStrategy = editedVoters[existingStrategyIndex];

        // Type guard to ensure existing strategy is a Whitelist strategy
        if ('members' in existingStrategy) {
          // if there's only one member left, remove the entire "Voter" by returning an empty array
          if (existingStrategy.members.length === 1) {
            updatedVoters = [
              ...editedVoters.slice(0, existingStrategyIndex),
              ...editedVoters.slice(existingStrategyIndex + 1),
            ];
          } else {
            // otherwise, remove the member from the "Voter"
            const updatedStrategy = {
              ...existingStrategy,
              members: existingStrategy.members.filter(m => m.address !== address),
            };
            updatedVoters = [
              ...editedVoters.slice(0, existingStrategyIndex),
              updatedStrategy,
              ...editedVoters.slice(existingStrategyIndex + 1),
            ];
          }
        } else {
          console.error('Invalid strategy type');
        }
      } else {
        console.error('No whitelist strategy found');
      }
    } else {
      updatedVoters = editedVoters.filter(s => {
        // we do this because the Whitelist type doesn't have an address field
        // this ensures that we don't remove the wrong "Voter"
        if ('address' in s) {
          return s.address !== address;
        } else {
          return true;
        }
      });
    }

    setEditedVoters(updatedVoters);
  };

  return (
    <Modal
      title="Edit voters"
      subtitle=""
      body={
        isAddingVoter ? (
          <VotersModal
            editMode
            voters={editedVoters}
            setVoters={setEditedVoters}
            setShowVotersModal={setIsAddingVoter}
            setIsAddingVoter={setIsAddingVoter}
          />
        ) : (
          <OverflowScroll height={200}>
            <Group gap={12} mb={12}>
              {editedVoters.map((s, idx) =>
                // not supported
                s.strategyType === VotingStrategyType.VANILLA ? (
                  <></>
                ) : // if it's a whitelist, we need to map over the members
                s.strategyType === VotingStrategyType.WHITELIST ? (
                  s.members.map((m, idx) => (
                    <Voter
                      key={idx}
                      type={s.strategyType}
                      address={m.address}
                      multiplier={Number(m.votingPower)}
                      isDisabled={s.members.length === 1}
                      removeVoter={handleRemoveVoter}
                    />
                  ))
                ) : (
                  // otherwise, proceed as normal
                  <Voter
                    key={idx}
                    type={s.strategyType}
                    address={s.address}
                    multiplier={s.multiplier}
                    isDisabled={editedVoters.length === 1}
                    removeVoter={handleRemoveVoter}
                  />
                ),
              )}
            </Group>
          </OverflowScroll>
        )
      }
      setShowModal={setShowVotersModal}
      button={
        <Button
          text={'Add a voter'}
          bgColor={ButtonColor.Green}
          onClick={() => setIsAddingVoter(true)}
        />
      }
      secondButton={
        // If the voter list has changed, show the save button
        hasVoterListChanged(round.voters, editedVoters) && (
          <Button
            text={'Save Changes'}
            bgColor={ButtonColor.Pink}
            onClick={handleEditVotersSave}
            disabled={editedVoters.length < 1}
          />
        )
      }
    />
  );
};

export default EditVotersModal;
