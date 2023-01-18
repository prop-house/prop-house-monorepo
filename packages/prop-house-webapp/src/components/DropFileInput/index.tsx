import { useRef } from 'react';
import classes from './DropFileInput.module.css';
import uploadImg from '../../assets/files/upload.png';
import { imageConfig } from './imageConfig';
import { formatBytes } from '../../utils/formatBytes';

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
          <img src={uploadImg} alt="upload" />
          <p className={classes.dropFileInputLabelFiles}>ex: JPG/JPEG, PNG, SVG, GIF, MOV</p>
        </div>

        <input
          type="file"
          multiple
          accept=".jpg, .jpeg, .png, .svg, .gif, .mov"
          onChange={onFileDrop}
        />
      </div>

      {invalidFileError && <span className={classes.invalidFile}>{invalidFileMessage}</span>}

      {
        <div className={classes.dropFilePreview}>
          {files.length > 0
            ? files.map((item, index) => {
                return (
                  <div key={index} className={classes.dropFilePreviewItem}>
                    <img
                      src={imageConfig[item.type.split('/')[1]] || imageConfig['default']}
                      alt=""
                    />

                    <div className={classes.dropFilePreviewItemInfo}>
                      <p>{item.name}</p>
                      <p>{formatBytes(item.size)}</p>
                    </div>

                    <span
                      className={classes.dropFilePreviewItemDel}
                      onClick={() => fileRemove(item)}
                    >
                      x
                    </span>
                  </div>
                );
              })
            : null}
        </div>
      }
    </>
  );
};

export default DropFileInput;
