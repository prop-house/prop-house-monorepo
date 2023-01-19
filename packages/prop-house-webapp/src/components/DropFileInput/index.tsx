import { useRef } from 'react';
import classes from './DropFileInput.module.css';
import uploadImg from '../../assets/files/upload.png';
import { imageConfig } from './imageConfig';
import { formatBytes } from '../../utils/formatBytes';
import Divider from '../Divider';

const DropFileInput: React.FC<{
  files: File[];
  setFiles: (files: File[]) => void;
  onFileDrop: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
  invalidFileMessage: string;
  invalidFileError: boolean;
  setInvalidFileError: (error: boolean) => void;
}> = props => {
  const { files, setFiles, onFileDrop, invalidFileMessage, invalidFileError, setInvalidFileError } =
    props;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onDragEnter = () => wrapperRef.current!.classList.add('dragover');
  const onDragLeave = () => wrapperRef.current!.classList.remove('dragover');
  const onDrop = () => wrapperRef.current!.classList.remove('dragover');

  const fileRemove = (file: File) => {
    setInvalidFileError(false);

    const updatedList = [...files];

    // remove the file from the list
    updatedList.splice(files.indexOf(file), 1);

    setFiles(updatedList);
  };

  return (
    <>
      <div
        ref={wrapperRef}
        className={classes.dropFileInput}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={classes.dropFileInputLabel}>
          <img className={classes.uploadImage} src={uploadImg} alt="upload" />
          <p className={classes.dragYourFiles}>Drag & drop your files here</p>
          <p className={classes.dropFileInputLabelFiles}>or click browse</p>
        </div>

        <input type="file" multiple accept=".jpg, .jpeg, .png, .svg, .gif" onChange={onFileDrop} />
      </div>

      {(invalidFileError || files.length > 0) && <Divider />}

      {files.length > 0 && <p className={classes.dropFilePreviewTitle}>Ready to upload</p>}

      {invalidFileError && <span className={classes.invalidFile}>{invalidFileMessage}</span>}

      {files.length > 0 ? (
        <div className={classes.dropFilePreview}>
          {files.map((item, index) => {
            return (
              <div key={index} className={classes.dropFilePreviewItem}>
                <img src={imageConfig[item.type.split('/')[1]] || imageConfig['default']} alt="" />

                <div className={classes.dropFilePreviewItemInfo}>
                  <p>{item.name}</p>
                  <p>{formatBytes(item.size)}</p>
                </div>

                <span className={classes.dropFilePreviewItemDel} onClick={() => fileRemove(item)}>
                  x
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
};

export default DropFileInput;
