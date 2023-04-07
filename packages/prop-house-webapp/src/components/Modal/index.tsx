import classes from './Modal.module.css';
import React, { Dispatch, SetStateAction, useEffect } from 'react';
import ReactModal from 'react-modal';
import Button, { ButtonColor } from '../Button';
import Divider from '../Divider';
import { useTranslation } from 'react-i18next';
import LoadingIndicator from '../LoadingIndicator';

const Modal: React.FC<{
  title: string | JSX.Element | boolean;
  subtitle: string | JSX.Element | boolean;
  image?: { src: string; alt: string } | any;
  loading?: boolean;
  body?: string | JSX.Element | any;
  button?: any;
  secondButton?: any;
  onRequestClose?: () => void;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const {
    title,
    subtitle,
    image,
    loading,
    button,
    secondButton,
    body,
    setShowModal,
    onRequestClose,
  } = props;
  const { t } = useTranslation();

  const closeModal = () => setShowModal(false);
  const closeButton = <Button text={t('Close')} bgColor={ButtonColor.White} onClick={closeModal} />;

  useEffect(() => {
    const disableScroll = () => {
      document.body.style.overflow = 'hidden';
      document.addEventListener('touchmove', preventTouchMove, { passive: false } as any); // Use 'any' type
    };

    const enableScroll = () => {
      document.body.style.overflow = 'auto';
      document.removeEventListener('touchmove', preventTouchMove, { passive: false } as any); // Use 'any' type
    };

    // Prevent touchmove event on mobile devices
    const preventTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    disableScroll();

    return () => enableScroll();
  }, []);

  return (
    <ReactModal
      isOpen={true}
      appElement={document.getElementById('root')!}
      onRequestClose={onRequestClose ? onRequestClose : closeModal}
      className={classes.modal}
    >
      <>
        <div className={classes.container}>
          <div>
            {loading ? (
              <LoadingIndicator width={150} height={125} />
            ) : (
              image && (
                <div className={classes.imgContainer}>
                  {<img src={image.src} alt={image.alt} />}
                </div>
              )
            )}

            <div className={classes.titleContainer}>
              {title && <p className={classes.modalTitle}>{title}</p>}
              {subtitle && <p className={classes.modalSubtitle}>{subtitle}</p>}
            </div>
          </div>

          {body && (
            <div>
              {' '}
              <Divider /> {body}{' '}
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

export default Modal;
