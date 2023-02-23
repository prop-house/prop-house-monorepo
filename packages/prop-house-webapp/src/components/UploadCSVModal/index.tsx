import React, { Dispatch, SetStateAction } from 'react';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';

const UploadCSVModal: React.FC<{
  setShowUploadCSVModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { setShowUploadCSVModal } = props;
  const { t } = useTranslation();

  const handleUpload = () => {
    console.log('handleUpload');
  };

  return (
    <Modal
      setShowModal={setShowUploadCSVModal}
      title={'Upload Addresses'}
      subtitle={'Upload a CSV file with addresses and voting power.'}
      image={NounImage.Chart}
      secondButton={
        <Button
          // disabled={loading || files.length === 0}
          text={t('Upload More?')}
          bgColor={ButtonColor.Green}
          onClick={handleUpload}
        />
      }
    />
  );
};

export default UploadCSVModal;
