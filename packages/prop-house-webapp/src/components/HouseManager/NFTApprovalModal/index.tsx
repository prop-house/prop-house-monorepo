import React, { Dispatch, SetStateAction, useEffect } from 'react';
import Modal from '../../Modal';
// import { Token } from '../../../state/slices/round';
import { TransactionStatus } from '../CreateRoundModal';
import LoadingIndicator from '../../LoadingIndicator';
import { NounImage } from '../../../utils/getNounImage';
import Button, { ButtonColor } from '../../Button';
import { Award } from '../AssetSelector';

const NFTApprovalModal: React.FC<{
  // award: Token;
  award: Award;
  status: TransactionStatus;
  handleClose: () => void;
  setShowNFTApprovalModal: Dispatch<SetStateAction<boolean>>;
  setIsApproved: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { award, status, handleClose, setShowNFTApprovalModal, setIsApproved } = props;

  const collection = `${award.name || award.symbol}`;

  // check for status.isSuccess to toggle approval
  useEffect(() => {
    if (status.isSuccess) setIsApproved(true);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.isSuccess]);

  const titleText = status.isLoading
    ? `Approving ${collection}`
    : status.isSuccess
    ? 'Approved'
    : status.isError
    ? 'Approval Error'
    : `Approve ${collection}`;

  const subtitleText = status.isLoading ? (
    ''
  ) : status.isSuccess ? (
    <>You have approved {collection} for use in the Prop House.</>
  ) : status.isError ? (
    `There was a problem approving ${collection}. Please try again.`
  ) : (
    `Please sign the transaction to approve ${collection}.`
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
      modalProps={{
        title: titleText,
        subtitle: subtitleText,
        body: status.isLoading && <LoadingIndicator />,
        image: image,
        setShowModal: setShowNFTApprovalModal,
        button: status.isSuccess && (
          <Button text="Finish creating round" bgColor={ButtonColor.Pink} onClick={handleClose} />
        ),
      }}
    />
  );
};

export default NFTApprovalModal;
