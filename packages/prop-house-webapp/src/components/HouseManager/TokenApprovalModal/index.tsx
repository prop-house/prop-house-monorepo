import React, { Dispatch, SetStateAction, useEffect } from 'react';
import Modal from '../../Modal';
import { Token } from '../../../state/slices/round';
import { TransactionStatus } from '../CreateRoundModal';
import LoadingIndicator from '../../LoadingIndicator';
import { NounImage } from '../../../utils/getNounImage';
import Button, { ButtonColor } from '../../Button';

const TokenApprovalModal: React.FC<{
  award: Token;
  isNFT: boolean;
  status: TransactionStatus;
  handleClose: () => void;
  setShowTokenApprovalModal: Dispatch<SetStateAction<boolean>>;
  setIsApproved: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { award, isNFT, status, handleClose, setShowTokenApprovalModal, setIsApproved } = props;

  const token = `${award.symbol} ${isNFT ? award.tokenId : ''}`;

  // check for status.isSuccess to toggle approval
  useEffect(() => {
    if (status.isSuccess) setIsApproved(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.isSuccess]);

  const titleText = status.isLoading
    ? `Approving ${token}`
    : status.isSuccess
    ? 'Approved'
    : status.isError
    ? 'Approval Error'
    : `Approve ${token}`;

  const subtitleText = status.isLoading ? (
    ''
  ) : status.isSuccess ? (
    <>You have approved {token} for use in the Prop House.</>
  ) : status.isError ? (
    `There was a problem approving ${token}. Please try again.`
  ) : (
    `Please sign the transaction to approving ${token}.`
  );

  const image = status.isLoading
    ? null
    : status.isSuccess
    ? NounImage.Thumbsup
    : status.isError
    ? NounImage.Hardhat
    : NounImage.Pencil;

  return (
    <Modal
      title={titleText}
      subtitle={subtitleText}
      body={status.isLoading && <LoadingIndicator />}
      image={image}
      setShowModal={setShowTokenApprovalModal}
      button={
        status.isSuccess && (
          <Button text="Finish creating round" bgColor={ButtonColor.Pink} onClick={handleClose} />
        )
      }
    />
  );
};

export default TokenApprovalModal;
