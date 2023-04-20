import classes from './Modal.module.css';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
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
  bottomContainer?: JSX.Element;
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
    bottomContainer,
  } = props;
  const { t } = useTranslation();

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const closeModal = () => setShowModal(false);
  const closeButton = <Button text={t('Close')} bgColor={ButtonColor.White} onClick={closeModal} />;

  useEffect(() => {
    const disableScroll = () => {
      document.body.style.overflow = 'hidden';
    };

    const enableScroll = () => {
      document.body.style.overflow = 'auto';
    };

    const stopTouchMovePropagation: EventListener = e => {
      e.stopPropagation();
    };

    const modalContainerElement = modalContainerRef.current;
    if (modalContainerElement) {
      modalContainerElement.addEventListener('touchmove', stopTouchMovePropagation, {
        passive: false,
      } as any);
    }

    disableScroll();

    return () => {
      if (modalContainerElement) {
        modalContainerElement.removeEventListener('touchmove', stopTouchMovePropagation, {
          passive: false,
        } as any);
      }
      enableScroll();
    };
  }, []);

  return (
    <ReactModal
      isOpen={true}
      appElement={document.getElementById('root')!}
      onRequestClose={onRequestClose ? onRequestClose : closeModal}
      className={classes.modal}
    >
      <>
        <div ref={modalContainerRef} className={classes.container}>
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

          <Divider noMarginDown />
          {body && <div className={classes.body}>{body}</div>}

          <Divider noMarginUp />
          <div>
            <div className={classes.buttonContainer}>
              {bottomContainer ? (
                bottomContainer
              ) : (
                <>
                  {button ? button : closeButton}
                  {secondButton && secondButton}
                </>
              )}
            </div>
          </div>
        </div>
      </>
    </ReactModal>
  );
};

export default Modal;
