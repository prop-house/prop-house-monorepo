import classes from './CreateRoundModal.module.css';
import React, { Dispatch, SetStateAction } from 'react';
import Modal from '../../Modal';
import { NounImage } from '../../../utils/getNounImage';
import Button, { ButtonColor } from '../../Button';
import LoadingIndicator from '../../LoadingIndicator';
import EthAddress from '../../EthAddress';
import { useAccount } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  checkStepCriteria,
  initialRound,
  setActiveStep,
  updateRound,
} from '../../../state/slices/round';

export type TransactionStatus = {
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error?: Error | null;
};

const CreateRoundModal: React.FC<{
  status: TransactionStatus;
  roundName: string;
  setShowCreateRoundModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { status, roundName, setShowCreateRoundModal } = props;

  const dipsatch = useDispatch();
  const { address: account } = useAccount();
  const { t } = useTranslation();
  let navigate = useNavigate();

  const titleText = status.isLoading ? (
    'Sending Transaction'
  ) : status.isSuccess ? (
    <>
      {t('congrats')} {account && <EthAddress className={classes.address} address={account} />}!
    </>
  ) : status.isError ? (
    'Transaction Error'
  ) : (
    'Sign Transaction'
  );

  const subtitleText = status.isLoading ? (
    ''
  ) : status.isSuccess ? (
    <>
      Your round <b>{roundName}</b> has been successfully created.
      <br /> Last step: deposit the assets required to get the round started!
    </>
  ) : status.isError ? (
    'There was a problem creating your round. Please try again.'
  ) : (
    'Please sign the transaction to create your round.'
  );

  const image = status.isLoading
    ? null
    : status.isSuccess
    ? NounImage.Crown
    : status.isError
    ? NounImage.Hardhat
    : NounImage.Pencil;

  const handleClick = () => {
    navigate('/dashboard');
    setShowCreateRoundModal(false);
    dipsatch(setActiveStep(1));
    dipsatch(updateRound(initialRound));
    dipsatch(checkStepCriteria());
  };

  const handleClose = () => {
    console.log('andling close');
    return status.isLoading
      ? undefined
      : status.isSuccess
      ? handleClick
      : setShowCreateRoundModal(false);
  };

  return (
    <Modal
      modalProps={{
        title: titleText,
        subtitle: subtitleText,
        handleClose: handleClose,
        body: status.isLoading && <LoadingIndicator />,
        image: image,
        setShowModal: setShowCreateRoundModal,
        button: status.isSuccess && (
          <Button text="View my rounds" bgColor={ButtonColor.Pink} onClick={handleClick} />
        ),
      }}
    />
  );
};

export default CreateRoundModal;
