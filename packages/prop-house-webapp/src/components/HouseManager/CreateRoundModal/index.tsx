import React, { Dispatch, SetStateAction } from 'react';
import Modal from '../../Modal';
import { NounImage } from '../../../utils/getNounImage';
import Button, { ButtonColor } from '../../Button';

type TransactionStatus = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: Error | null;
};

const CreateRoundModal: React.FC<{
  setShowCreateRoundModal: Dispatch<SetStateAction<boolean>>;
  status: TransactionStatus;
}> = props => {
  const { setShowCreateRoundModal, status } = props;

  return (
    <Modal
      title={
        status.isLoading
          ? 'Sending Transaction'
          : status.isSuccess
          ? 'Success'
          : status.isError
          ? 'Error'
          : 'Sign Transaction'
      }
      subtitle=""
      body={
        <>
          {status.isLoading ? (
            <div>Loading...</div>
          ) : status.isSuccess ? (
            <div>Success</div>
          ) : status.isError ? (
            <div>Error: {status.error?.message}</div>
          ) : (
            <div>Idle</div>
          )}
        </>
      }
      image={NounImage.House}
      setShowModal={setShowCreateRoundModal}
      secondButton={
        status.isSuccess && (
          <Button
            text="Back to Houses"
            bgColor={ButtonColor.Pink}
            onClick={() => {
              // refresh the page
              window.location.reload();
              setShowCreateRoundModal(false);
            }}
          />
        )
      }
    />
  );
};

export default CreateRoundModal;
