import classes from './VotingStrategyModal.module.css';
import React, { SetStateAction, useState } from 'react';
import ReactModal from 'react-modal';
import { StrategyType, newStrategy, NewStrategy } from '../StrategiesConfig';
import { VotingStrategyConfig } from '@prophouse/sdk-react';
import VotingStrategies from '../VotingStrategies';
import AddVotingStrategy from '../AddVotingStrategy';
import Divider from '../../Divider';

const VotingStrategyModal: React.FC<{
  editMode?: boolean;
  strategies: VotingStrategyConfig[];
  setStrategies: (strategies: VotingStrategyConfig[]) => void;
  setShowVotingStrategyModal: (show: boolean) => void;
}> = props => {
  const { editMode, strategies, setStrategies, setShowVotingStrategyModal } = props;
  const [strat, setStrat] = useState<NewStrategy>(newStrategy);
  const [selectedStrategy, setSelectedStrategy] = useState<string>(StrategyType.ERC721);
  const [currentView, setCurrentView] = useState<'showStrategies' | 'addStrategies'>(
    'showStrategies',
  );

  // Reset the strategy when the modal is closed
  const handleCloseModal = () => {
    setStrat(newStrategy);
    setShowVotingStrategyModal(false);
    setSelectedStrategy(StrategyType.ERC721);
  };

  // TODO: This is a bit of a hack, but it works for now
  const handleCancel = (type?: SetStateAction<'showStrategies' | 'addStrategies'>) => {
    if (editMode && type) {
      setCurrentView(type);
    } else {
      setShowVotingStrategyModal(false);
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
            {currentView === 'addStrategies' && (
              <AddVotingStrategy
                strat={strat}
                strategies={strategies}
                selectedStrategy={selectedStrategy}
                setStrat={setStrat}
                setStrategies={setStrategies}
                setSelectedStrategy={setSelectedStrategy}
                handleCancel={() => handleCancel('showStrategies')}
              />
            )}

            {currentView === 'showStrategies' && (
              <>
                <div>
                  <div className={classes.titleContainer}>
                    <p className={classes.modalTitle}>Edit voting strategies</p>
                  </div>
                </div>
                <Divider />
                <VotingStrategies
                  editMode={editMode}
                  strategies={strategies}
                  setStrategies={setStrategies}
                  setCurrentView={setCurrentView}
                  setShowVotingStrategyModal={setShowVotingStrategyModal}
                />
              </>
            )}
          </>
        ) : (
          <AddVotingStrategy
            strat={strat}
            strategies={strategies}
            selectedStrategy={selectedStrategy}
            setStrat={setStrat}
            setStrategies={setStrategies}
            setSelectedStrategy={setSelectedStrategy}
            handleCancel={handleCancel}
            // setShowVotingStrategyModal={editMode ? setCurrentView : setShowVotingStrategyModal}
          />
        )}
      </ReactModal>
    </>
  );
};

export default VotingStrategyModal;
