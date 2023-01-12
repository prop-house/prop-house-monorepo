import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';

const ErrorVotingModal: React.FC<{
  showErrorVotingModal: boolean;
  setShowErrorVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { showErrorVotingModal, setShowErrorVotingModal } = props;
  const { t } = useTranslation();

  return (
    <Modal
      title={t('errorModalTitle')}
      subtitle={t('errorModalMessage')}
      image={NounImage.Banana}
      showModal={showErrorVotingModal}
      setShowModal={setShowErrorVotingModal}
    />
  );
};

export default ErrorVotingModal;
