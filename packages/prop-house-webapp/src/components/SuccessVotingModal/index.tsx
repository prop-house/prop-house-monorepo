import React, { Dispatch, SetStateAction } from 'react';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';

const SuccessVotingModal: React.FC<{
  setShowSuccessVotingModal: Dispatch<SetStateAction<boolean>>;
  numPropsVotedFor: number;
  signerIsContract: boolean;
}> = props => {
  const { setShowSuccessVotingModal, numPropsVotedFor, signerIsContract } = props;
  const { t } = useTranslation();

  const eoaSignerMsg = `${t('youveSuccessfullyVotedFor')} ${numPropsVotedFor} ${
    numPropsVotedFor === 1 ? t('prop') : t('props')
  }!`;
  const contractSignerMsg = `${t('youveSubmittedVotesFor')} ${
    numPropsVotedFor === 1 ? t('prop') : t('props')
  }. ${t('theyWillBeCounted')}.`;

  return (
    <Modal
      setShowModal={setShowSuccessVotingModal}
      title={t('veryNounish')}
      subtitle={signerIsContract ? contractSignerMsg : eoaSignerMsg}
      image={NounImage.Glasses}
      button={
        <Button
          text={t('close')}
          bgColor={ButtonColor.White}
          onClick={() => {
            setShowSuccessVotingModal(false);
          }}
        />
      }
    />
  );
};

export default SuccessVotingModal;
