import React, { useState } from 'react';
import classes from './ProposalModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Proposal from '../pages/Proposal';

const ProposalModal = () => {
  const [showProposalModal, setShowProposalModal] = useState(true);

  return (
    <Modal
      isOpen={showProposalModal}
      onRequestClose={() => setShowProposalModal(false)}
      className={clsx(classes.modal)}
    >
      <Proposal />
    </Modal>
  );
};

export default ProposalModal;
