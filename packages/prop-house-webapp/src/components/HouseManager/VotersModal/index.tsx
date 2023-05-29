import classes from './VotersModal.module.css';
import React, { useState } from 'react';
import ReactModal from 'react-modal';
import { newVoter, NewVoter } from '../VotersConfig';
import { VotingStrategyConfig } from '@prophouse/sdk-react';
import AddVoter, { StrategyType } from '../AddVoter';

/**
 * @see editMode is used to determine whether or not we're editing from Step 6,
 * in which case we don't want to dispatch the saveRound thunk, rather we want to
 * track the changes in the parent component and dispatch the saveRound thunk
 * when the user clicks "Save Changes"
 */

const VotersModal: React.FC<{
  editMode?: boolean;
  setEditedRound?: React.Dispatch<React.SetStateAction<NewVoter>>;
  voters: VotingStrategyConfig[];
  setVoters: (voters: VotingStrategyConfig[]) => void;
  setShowVotersModal: (show: boolean) => void;
  setIsAddingVoter?: (show: boolean) => void;
}> = props => {
  const { editMode, voters, setVoters, setShowVotersModal, setIsAddingVoter } = props;

  const [voter, setVoter] = useState<NewVoter>(newVoter);
  const [selectedStrategy, setSelectedStrategy] = useState<string>(StrategyType.ERC721);

  // Reset the strategy when the modal is closed
  const handleCloseModal = () => {
    setVoter(newVoter);
    setShowVotersModal(false);
    setSelectedStrategy(StrategyType.ERC721);
  };

  // TODO: This is a bit of a hack, but it works for now
  const handleCancel = () => {
    if (editMode) {
      setIsAddingVoter!(false);
    } else {
      setShowVotersModal(false);
    }
  };

  return (
    <>
      <ReactModal
        isOpen={true}
        appElement={document.getElementById('root')!}
        onRequestClose={handleCloseModal}
        className={classes.modal}
      >
        <AddVoter
          editMode={editMode}
          voter={voter}
          voters={voters}
          selectedStrategy={selectedStrategy}
          setVoter={setVoter}
          setVoters={setVoters}
          setSelectedStrategy={setSelectedStrategy}
          handleCancel={handleCancel}
        />
      </ReactModal>
    </>
  );
};

export default VotersModal;
