import { useRef } from 'react';
import classes from './DropFileInput.module.css';
import uploadImg from '../../assets/files/upload.png';
import { imageConfig } from './imageConfig';
import { formatBytes } from '../../utils/formatBytes';
import Divider from '../Divider';
import { capitalize } from '../../utils/capitalize';

const DropFileInput: React.FC<{
  files: File[];
  duplicateFile: { error: boolean; name: string };
  fileRemove: (file: File) => void;
  onFileDrop: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
  invalidFileMessage: string;
  invalidFileError: boolean;
}> = props => {
  const { files, duplicateFile, onFileDrop, fileRemove, invalidFileMessage, invalidFileError } =
    props;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onDragEnter = () => wrapperRef.current!.classList.add('dragover');
  const onDragLeave = () => wrapperRef.current!.classList.remove('dragover');
  const onDrop = () => wrapperRef.current!.classList.remove('dragover');

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
          <p className={classes.dropFileInputLabelFiles}>or click to browse</p>
        </div>

        <input type="file" multiple accept=".jpg, .jpeg, .png, .svg, .gif" onChange={onFileDrop} />
      </div>
      {(invalidFileError || files.length > 0) && <Divider />}
      {files.length > 0 && <p className={classes.dropFilePreviewTitle}>Ready to upload</p>}
      {(invalidFileError || duplicateFile.error) && (
        <span className={classes.invalidFile}>
          {invalidFileError && duplicateFile.error
            ? capitalize(invalidFileMessage) + ` and ${duplicateFile.name}`
            : invalidFileError
            ? capitalize(invalidFileMessage)
            : duplicateFile.error
            ? capitalize(duplicateFile.name)
            : ''}
        </span>
      )}

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
