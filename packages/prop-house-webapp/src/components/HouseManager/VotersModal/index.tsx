import classes from './VotersModal.module.css';
import React, { SetStateAction, useState } from 'react';
import ReactModal from 'react-modal';
import { newVoter, NewVoter } from '../VotersConfig';
import { VotingStrategyConfig } from '@prophouse/sdk-react';
import Voters from '../Voters';
import AddVoter, { StrategyType } from '../AddVoter';
import Divider from '../../Divider';

/**
 * @see editMode is used to determine whether or not we're editing from Step 6,
 * in which case we don't want to dispatch the saveRound thunk, rather we want to
 * track the changes in the parent component and dispatch the saveRound thunk
 * when the user clicks "Save Changes"
 */

const VotersModal: React.FC<{
  editMode?: boolean;
  voters: VotingStrategyConfig[];
  setVoters: (voters: VotingStrategyConfig[]) => void;
  setShowVotersModal: (show: boolean) => void;
}> = props => {
  const { editMode, voters, setVoters, setShowVotersModal } = props;
  const [voter, setVoter] = useState<NewVoter>(newVoter);
  const [selectedStrategy, setSelectedStrategy] = useState<string>(StrategyType.ERC721);
  const [currentView, setCurrentView] = useState<'showVoters' | 'addVoters'>('showVoters');

  // Reset the strategy when the modal is closed
  const handleCloseModal = () => {
    setVoter(newVoter);
    setShowVotersModal(false);
    setSelectedStrategy(StrategyType.ERC721);
  };

  // TODO: This is a bit of a hack, but it works for now
  const handleCancel = (type?: SetStateAction<'showVoters' | 'addVoters'>) => {
    if (editMode && type) {
      setCurrentView(type);
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
        {editMode ? (
          <>
            {currentView === 'addVoters' && (
              <AddVoter
                voter={voter}
                voters={voters}
                selectedStrategy={selectedStrategy}
                setVoter={setVoter}
                setVoters={setVoters}
                setSelectedStrategy={setSelectedStrategy}
                handleCancel={() => handleCancel('showVoters')}
              />
            )}

            {currentView === 'showVoters' && (
              <>
                <div>
                  <div className={classes.titleContainer}>
                    <p className={classes.modalTitle}>Edit voters</p>
                  </div>
                </div>

                <Divider />

                <Voters
                  editMode={editMode}
                  voters={voters}
                  setVoters={setVoters}
                  setCurrentView={setCurrentView}
                  setShowVotersModal={setShowVotersModal}
                />
              </>
            )}
          </>
        ) : (
          <AddVoter
            voter={voter}
            voters={voters}
            selectedStrategy={selectedStrategy}
            setVoter={setVoter}
            setVoters={setVoters}
            setSelectedStrategy={setSelectedStrategy}
            handleCancel={handleCancel}
            // setShowVotersModal={editMode ? setCurrentView : setShowVotersModal}
          />
        )}
      </ReactModal>
    </>
  );
};

export default VotersModal;
