import classes from './ProposalWindowButtons.module.css';
import Button, { ButtonColor } from '../Button';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import { useNavigate } from 'react-router-dom';
import { isSameAddress } from '../../utils/isSameAddress';
import removeTags from '../../utils/removeTags';
import { ProposalFields } from '../../utils/proposalFields';
import { useEthers } from '@usedapp/core';

import { useState } from 'react';
import DeleteProposalModal from '../DeleteProposalModal';
import SaveProposalModal from '../SaveProposalModal';

const ProposalWindowButtons: React.FC<{
  proposal: StoredProposalWithVotes;
  editProposalMode: boolean;
  setEditProposalMode: (e: any) => void;
}> = props => {
  const { proposal, editProposalMode, setEditProposalMode } = props;
  const [showSavePropModal, setShowSavePropModal] = useState(false);
  const [showDeletePropModal, setShowDeletePropModal] = useState(false);

  const { account } = useEthers();
  const navigate = useNavigate();
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const proposalEditorData = useAppSelector(state => state.editor.proposal);

  const isValidPropData = (data: ProposalFields) =>
    data.title.length > 4 &&
    removeTags(data.what).length > 49 &&
    data.tldr.length > 9 &&
    data.tldr.length < 121;

  // const saveProposal = () => setEditProposalMode(false);
  // const deleteProposal = () => setEditProposalMode(false);
  const cancelSavingProposal = () => setEditProposalMode(false);

  return (
    <>
      {showSavePropModal && (
        <SaveProposalModal showModal={showSavePropModal} setShowModal={setShowSavePropModal} />
      )}

      {showDeletePropModal && (
        <DeleteProposalModal
          showModal={showDeletePropModal}
          setShowModal={setShowDeletePropModal}
        />
      )}

      {/* MY PROP */}
      {account &&
        (isSameAddress(proposal.address, account) ? (
          <div className={classes.proposalWindowButtons}>
            {editProposalMode ? (
              <>
                <div></div>
                <div className={classes.editModeButtons}>
                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Cancel'}
                    bgColor={ButtonColor.Gray}
                    onClick={cancelSavingProposal}
                  />

                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Save'}
                    bgColor={ButtonColor.Purple}
                    onClick={() => setShowSavePropModal(true)}
                    disabled={!isValidPropData(proposalEditorData)}
                  />
                </div>
              </>
            ) : (
              <>
                <Button
                  text={'+ New Prop'}
                  bgColor={ButtonColor.PurpleLight}
                  onClick={() => navigate('/create', { state: { auction: round, community } })}
                />

                <div className={classes.editModeButtons}>
                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Delete'}
                    bgColor={ButtonColor.Red}
                    onClick={() => setShowDeletePropModal(true)}
                  />

                  <Button
                    classNames={classes.fullWidthButton}
                    text={'Edit Prop'}
                    bgColor={ButtonColor.Purple}
                    onClick={() => setEditProposalMode(true)}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
          // NOT MY PROP
          <Button
            classNames={classes.fullWidthButton}
            text={'+ New Prop'}
            bgColor={ButtonColor.PurpleLight}
            onClick={() => navigate('/create', { state: { auction: round, community } })}
          />
        ))}
    </>
  );
};

export default ProposalWindowButtons;
