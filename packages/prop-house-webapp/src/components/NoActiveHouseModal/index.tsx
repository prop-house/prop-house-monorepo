import React from 'react';
import Modal from '../Modal';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NounImage } from '../../utils/getNounImage';

const NoActiveHouseModal: React.FC<{}> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal
      modalProps={{
        setShowModal: () => {}, // Replace this with the actual setShowModal logic
        handleClose: () => navigate(`/`),
        title: t('noRoundSelected'),
        subtitle: t('proposalCreation'),
        image: NounImage.Glasses,
      }}
    />
  );
};

export default NoActiveHouseModal;
