import React, { useState } from "react";
import classes from "./ProposalImageModal.module.css";
import xIcon from "../../assets/icons/x-icon.png";
import clsx from "clsx";
import Modal from "react-modal";
import Button, { ButtonColor } from "../Button";

const ProposalImageModal: React.FC<{
  quill: any;
  Quill: any;
  title: string;
  subtitle: string;
  showModal: boolean;
  setShowModal: any;
}> = (props) => {
  const { quill, Quill, title, subtitle, showModal, setShowModal } = props;

  const [imageLink, setImageLink] = useState("");

  function closeModal() {
    setShowModal(false);
  }
  return (
    <Modal
      isOpen={showModal}
      onRequestClose={closeModal}
      className={clsx(classes.modal)}
    >
      {quill && (
        <>
          <div className={classes.imageLinkInfo}>
            <button className={classes.closeButton} onClick={closeModal}>
              <img src={xIcon} alt="Button to close modal" />
            </button>
            <h3>{title}</h3>

            <p>{subtitle}</p>
            <input
              type="text"
              autoFocus
              placeholder="ex. https://noun.pics/1.jpg"
              className={classes.imageLinkInput}
              value={imageLink}
              onChange={(e) => {
                setImageLink(e.target.value);
              }}
            />
          </div>

          <Button
            text="Submit"
            bgColor={ButtonColor.Green}
            disabled={imageLink === ""}
            onClick={() => {
              console.log("q", quill, imageLink);

              quill.insertEmbed(
                quill.getSelection().index,
                "image",
                imageLink,
                Quill.sources.USER
              );

              setShowModal(false);
              setImageLink("");
            }}
          />
        </>
      )}
    </Modal>
  );
};

export default ProposalImageModal;
