import classes from './Modal.module.css';
import React, { Dispatch, SetStateAction } from 'react';
import clsx from 'clsx';
import ReactModal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import Divider from '../Divider';
import { useTranslation } from 'react-i18next';

const Modal: React.FC<{
  title: string;
  subtitle: string;
  image?: { src: string; alt: string };
  button?: any;
  secondButton?: any;
  onRequestClose?: () => void;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { title, subtitle, image, button, secondButton, showModal, setShowModal, onRequestClose } = props;
  const { t } = useTranslation();

  const closeModal = () => setShowModal(false);
  const closeButton = <Button text={t('Close')} bgColor={ButtonColor.White} onClick={closeModal} />;

  return (
    <ReactModal isOpen={showModal} onRequestClose={onRequestClose ? onRequestClose : closeModal} className={clsx(classes.modal)}>
      <>
        <div className={classes.container}>
          <div>
            {image && <div className={classes.imgContainer}>
              <img src={image.src} alt={image.alt} />
            </div>}

            <div className={classes.titleContainer}>
              <p className={classes.modalTitle}>{title}</p>
              <p className={classes.modalSubtitle}>{subtitle}</p>
            </div>
          </div>

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

export default Modal;