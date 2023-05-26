import classes from './Modal.module.css';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import ReactModal from 'react-modal';

import LoadingIndicator from '../LoadingIndicator';
import { IoClose } from 'react-icons/io5';
import clsx from 'clsx';
import { isMobile } from 'web3modal';

const Modal: React.FC<{
  title: string | JSX.Element | boolean;
  subtitle: string | JSX.Element | boolean;
  image?: { src: string; alt: string } | any;
  loading?: boolean;
  body?: string | JSX.Element | any;
  button?: any;
  secondButton?: any;
  bottomContainer?: JSX.Element;
  handleClose?: () => void;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  fullScreenOnMobile?: boolean;
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
    handleClose,
    bottomContainer,
    fullScreenOnMobile,
  } = props;

  const modalContainerRef = useRef<HTMLDivElement>(null);
  const closeModal = () => setShowModal(false);

  useEffect(() => {
    const disableScroll = () => {
      document.body.style.overflow = 'hidden';
      if (fullScreenOnMobile && isMobile()) document.body.style.position = 'fixed';
    };

    const enableScroll = () => {
      document.body.style.overflow = 'auto';
      document.body.style.position = 'initial';
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
  }, [fullScreenOnMobile]);

  const titleAndSubtitle = (
    <div className={classes.titleAndSubtitleContainer}>
      {title && <p className={classes.modalTitle}>{title}</p>}
      {subtitle && <p className={classes.modalSubtitle}>{subtitle}</p>}
    </div>
  );

  return (
    <ReactModal
      isOpen={true}
      appElement={document.getElementById('root')!}
      onRequestClose={handleClose ? handleClose : closeModal}
      className={clsx(
        classes.modal,
        fullScreenOnMobile && classes.fullScreenOnMobile,
        'proposalModalContainer',
      )}
    >
      <div ref={modalContainerRef} className={classes.container}>
        <div>
          {loading ? (
            <LoadingIndicator width={150} height={125} />
          ) : (
            image && (
              <div className={classes.titleContainer}>
                <div style={{ width: '32px' }}></div>
                <div className={classes.imgContainer}>
                  {<img src={image.src} alt={image.alt} />}
                </div>
                <div className={classes.closeBtn} onClick={handleClose ? handleClose : closeModal}>
                  <IoClose size={'1.5rem'} />
                </div>
              </div>
            )
          )}

          <div className={classes.titleContainer}>
            {image ? (
              titleAndSubtitle
            ) : (
              <>
                {/* Balance for the X button width to keep title centered */}
                <div className={classes.gap}>{''}</div>

                {titleAndSubtitle}

                <div className={classes.closeBtn} onClick={handleClose ? handleClose : closeModal}>
                  <IoClose size={'1.5rem'} />
                </div>
              </>
            )}
          </div>
        </div>

        {body && <div className={classes.body}>{body}</div>}

        <div
          className={clsx(
            classes.footer,
            !button && !secondButton && !bottomContainer && classes.noFooter,
          )}
        >
          <div className={classes.buttonContainer}>
            {bottomContainer ? (
              bottomContainer
            ) : (
              <>
                {button && button}
                {secondButton && secondButton}
              </>
            )}
          </div>
        </div>
      </div>
    </ReactModal>
  );
};

export default Modal;
