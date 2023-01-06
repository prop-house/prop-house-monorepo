import React, { Dispatch, SetStateAction } from 'react';
import classes from './ProposalSuccessModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { nameToSlug } from '../../utils/communitySlugs';
import { useTranslation } from 'react-i18next';
import { useEthers } from '@usedapp/core';
import EthAddress from '../EthAddress';
import { openInNewTab } from '../../utils/openInNewTab';

const ProposalSuccessModal: React.FC<{
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  proposalId?: number;
  house: string;
  round: string;
}> = props => {
  const { showModal, setShowModal, proposalId, house, round } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { account } = useEthers();

  const twitterContent = `Check out my @NounsPropHouse prop: https://prop.house/proposal/${proposalId}`;

  return (
    <Modal
      isOpen={showModal}
      onRequestClose={() => {
        navigate(`/${nameToSlug(house)}/${nameToSlug(round)}`);
        setShowModal(false);
      }}
      className={clsx(classes.modal)}
    >
      <div className={classes.container}>
        <div className={classes.imgContainer}>
          <img src="/heads/heart.png" alt="heart" />
        </div>

        <div className={classes.titleContainer}>
          <p className={classes.modalTitle}>
            {t('congrats')}{' '}
            {account && <EthAddress className={classes.address} address={account} />}!
          </p>

          <p className={classes.modalSubtitle}>
            {t(`successfulSubmission`)} <b>{round}</b> for <b>{house}</b>.
          </p>
        </div>
      </div>

      <hr className={classes.divider} />

      <div className={classes.buttonContainer}>
        <Button
          text={t('backToRound')}
          bgColor={ButtonColor.White}
          onClick={() => {
            navigate(`/${nameToSlug(house)}/${nameToSlug(round)}`);
            setShowModal(false);
          }}
        />
        <Button
          text={'Share on Twitter'}
          bgColor={ButtonColor.Purple}
          onClick={() => {
            openInNewTab(`https://twitter.com/intent/tweet?text=${twitterContent}`);
          }}
        />
      </div>
    </Modal>
  );
};

export default ProposalSuccessModal;