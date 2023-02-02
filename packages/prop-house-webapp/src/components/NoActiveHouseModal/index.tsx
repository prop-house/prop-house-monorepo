import React from 'react';
import Modal from '../Modal';
import { useNavigate } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import { NounImage } from '../../utils/getNounImage';

const NoActiveHouseModal: React.FC<{}> = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal
      setShowModal={() => {}}
      onRequestClose={() => {
        navigate(`/`);
      }}
      title={t('noRoundSelected')}
      subtitle={t('proposalCreation')}
      image={NounImage.Glasses}
      button={
        <Button
          text={t('goHome')}
          bgColor={ButtonColor.White}
          onClick={() => {
            navigate(`/`);
          }}
        />
      }
    />
  );
};

export default NoActiveHouseModal;
