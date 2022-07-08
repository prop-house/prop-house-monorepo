import React, { useState } from "react";
import classes from "./QuillEditorModal.module.css";
import xIcon from "../../assets/icons/x-icon.png";
import clsx from "clsx";
import Modal from "react-modal";
import Button, { ButtonColor } from "../Button";
import httpsChecker from "../../utils/httpsChecker";
import { useTranslation } from "react-i18next";

const QuillEditorModal: React.FC<{
  quill: any;
  Quill: any;
  title: string;
  subtitle: string;
  showModal: boolean;
  setShowModal: any;
  placeholder: string;
  quillModule: string;
}> = (props) => {
  const {
    quill,
    Quill,
    title,
    subtitle,
    showModal,
    setShowModal,
    placeholder,
    quillModule,
  } = props;

  const [imageLink, setImageLink] = useState("https://");
  const { t } = useTranslation();

  function closeModal() {
    setShowModal(false);
  }

  return (
    <Modal
      isOpen={showModal}
      onRequestClose={closeModal}
      className={clsx(classes.modal)}
    >
      <div className={classes.imageLinkInfo}>
        <button className={classes.closeButton} onClick={closeModal}>
          <img src={xIcon} alt="Button to close modal" />
        </button>
        <h3>{title}</h3>

        <p>{subtitle}</p>
        <input
          type="text"
          autoFocus
          placeholder={placeholder}
          className={classes.imageLinkInput}
          value={imageLink}
          onChange={(e) => {
            setImageLink(e.target.value);
          }}
        />
      </div>

      <Button
        text={t("submit")}
        bgColor={ButtonColor.Green}
        disabled={imageLink === ""}
        onClick={() => {
          if (quillModule === "image") {
            quill.setSelection(quill.getLength(), 0);
            quill.insertEmbed(
              quill.getSelection().index,
              "image",
              httpsChecker(imageLink),
              Quill.sources.USER
            );
          } else if (quillModule === "link") {
            quill.setSelection();
            console.log("ran");
            quill.format("link", imageLink, Quill.sources.USER);
          } else return;

          setShowModal(false);
          setImageLink("https://");
        }}
      />
    </Modal>
  );
};

export default QuillEditorModal;
