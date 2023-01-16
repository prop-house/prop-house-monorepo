import classes from './NewModal.module.css';
import React, { Dispatch, SetStateAction } from 'react';
import ReactModal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import Divider from '../Divider';
import { useTranslation } from 'react-i18next';

const NewModal: React.FC<{
  title: string | JSX.Element | boolean;
  subtitle: string | JSX.Element | boolean;
  image?: boolean;
  body?: string | JSX.Element | any;
  button?: any;
  secondButton?: any;
  onRequestClose?: () => void;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const {
    title,
    subtitle,
    image,
    button,
    secondButton,
    body,
    showModal,
    setShowModal,
    onRequestClose,
  } = props;
  const { t } = useTranslation();

  const closeModal = () => setShowModal(false);
  const closeButton = <Button text={t('Close')} bgColor={ButtonColor.White} onClick={closeModal} />;

  return (
    <ReactModal
      isOpen={showModal}
      onRequestClose={onRequestClose ? onRequestClose : closeModal}
      className={classes.modal}
    >
      <>
        <div className={classes.container}>
          <div>
            {image && (
              <div className={classes.imgContainer}>
                <img src="/heads/camera.png" alt="camera" />
              </div>
            )}

            <div className={classes.titleContainer}>
              {title && <p className={classes.modalTitle}>{title}</p>}
              {subtitle && <p className={classes.modalSubtitle}>{subtitle}</p>}
            </div>
          </div>

          {body && (
            <div>
              {' '}
              <Divider />
              {body}{' '}
            </div>
          )}

          <div>
            <Divider />
            <div className={classes.buttonContainer}>
              {button ? button : closeButton}
              {secondButton && secondButton}
            </div>
          </div>
        </div>
      </>
    </ReactModal>
  );
};

export default NewModal;
