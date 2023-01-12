import classes from './Modal.module.css';
import ReactDOM from 'react-dom';
import xIcon from '../../assets/icons/x-icon.png';
import React from 'react';

export const Backdrop: React.FC<{ onDismiss: () => void }> = (props) => {
  return <div className={classes.backdrop} onClick={props.onDismiss} />;
};

export interface ModalData {
  title: string;
  content: React.ReactNode;
  onDismiss: () => void;
}

const ModalOverlay: React.FC<{
  data: ModalData;
}> = (props) => {
  const { title, content, onDismiss } = props.data;
  return (
    <div className={classes.modal}>
      <button className={classes.closeButton} onClick={onDismiss}>
        <img src={xIcon} alt="Button to close modal" />
      </button>
      <h3>{title}</h3>
      <div className={classes.content}>{content}</div>
    </div>
  );
};

const Modal: React.FC<{
  data: ModalData;
}> = (props) => {
  const { data } = props;
  return (
    <>
      {ReactDOM.createPortal(
        <Backdrop onDismiss={data.onDismiss} />,
        document.getElementById('backdrop-root')!
      )}
      {ReactDOM.createPortal(
        <ModalOverlay data={data} />,
        document.getElementById('overlay-root')!
      )}
    </>
  );
};

export default Modal;
