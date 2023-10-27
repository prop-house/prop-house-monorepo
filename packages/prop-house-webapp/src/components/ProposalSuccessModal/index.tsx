import React, { Dispatch, SetStateAction } from 'react';
import classes from './ProposalSuccessModal.module.css';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EthAddress from '../EthAddress';
import { openInNewTab } from '../../utils/openInNewTab';
import Modal from '../Modal';
import { NounImage } from '../../utils/getNounImage';
import { useAccount } from 'wagmi';
import { House, Round } from '@prophouse/sdk-react';

const ProposalSuccessModal: React.FC<{
  setShowProposalSuccessModal: Dispatch<SetStateAction<boolean>>;
  propSubmissionTxId?: string;
  house: House;
  round: Round;
}> = props => {
  const { setShowProposalSuccessModal, propSubmissionTxId, house, round } = props;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { address: account } = useAccount();
  const twitterContent = `Check out my @nounsprophouse prop: https://prop.house/proposal/${propSubmissionTxId}`;

  const backToRound = () => {
    navigate(`/${round.address}`, { replace: false });
    setShowProposalSuccessModal(false);
  };
  return (
    <Modal
      modalProps={{
        setShowModal: setShowProposalSuccessModal,
        title: (
          <>
            {t('congrats')}{' '}
            {account && <EthAddress className={classes.address} address={account} />}!
          </>
        ),
        subtitle: (
          <>
            {t(`successfulSubmission`)} <b>{round.title}</b> for <b>{house.name}</b>.
          </>
        ),
        image: NounImage.Heart,
        handleClose: backToRound,
        button: (
          <>
            <Button
              text={'Share on Warpcast'}
              bgColor={ButtonColor.Purple}
              onClick={() => {
                openInNewTab(
                  `https://warpcast.com/~/compose?text=Check+out+my+prop:+https://prop.house/${propSubmissionTxId}/`,
                );
              }}
            />
            <Button
              text={'Share on Twitter'}
              bgColor={ButtonColor.Purple}
              onClick={() => {
                openInNewTab(`https://twitter.com/intent/tweet?text=${twitterContent}`);
              }}
            />
          </>
        ),
      }}
    />
  );
};

export default ProposalSuccessModal;
