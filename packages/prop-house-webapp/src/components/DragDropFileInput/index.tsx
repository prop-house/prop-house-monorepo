import { useRef } from 'react';
import classes from './DragDropFileInput.module.css';
import uploadImg from '../../assets/files/upload.png';
import { formatBytes } from '../../utils/formatBytes';
import Divider from '../Divider';
import { capitalize } from '../../utils/capitalize';
import fileDefault from '../../assets/files/file-blank.png';
import fileJpg from '../../assets/files/jpg.png';
import fileJpeg from '../../assets/files/jpg.png';
import filePng from '../../assets/files/png.png';
import fileGif from '../../assets/files/gif.png';
import fileSvg from '../../assets/files/svg.png';
import fileMov from '../../assets/files/mov.png';

interface FileIconProps {
  [key: string]: string;
}

export const fileIcons: FileIconProps = {
  default: fileDefault,
  png: filePng,
  jpg: fileJpg,
  jpeg: fileJpeg,
  gif: fileGif,
  svg: fileSvg,
  'svg+xml': fileSvg,
  quicktime: fileMov,
};

const DragDropFileInput: React.FC<{
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

  // event listeners for drag and drop
  const onDragEnter = () => wrapperRef.current!.classList.add('dragover');
  const onDragLeave = () => wrapperRef.current!.classList.remove('dragover');
  const onDrop = () => wrapperRef.current!.classList.remove('dragover');

  return (
    <>
      <div
        ref={wrapperRef}
        className={classes.fileInput}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        <div className={classes.inputLabelContainer}>
          <img className={classes.uploadImagePicture} src={uploadImg} alt="upload" />
          <p className={classes.inputLabelTitle}>Drag & drop your files here</p>
          <p className={classes.inputLabelSubtitle}>or click to browse</p>
        </div>

        {/* multiple = multi-file upload */}
        <input type="file" multiple accept=".jpg, .jpeg, .png, .svg, .gif" onChange={onFileDrop} />
      </div>

      {(invalidFileError || files.length > 0) && <Divider />}

      {files.length > 0 && <p className={classes.uploadReadyTitle}>Ready to upload</p>}

      {(invalidFileError || duplicateFile.error) && (
        <span className={classes.invalidFileMessage}>
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
        <div className={classes.uploadedFilesContainer}>
          {files.map((item, index) => {
            return (
              <div key={index} className={classes.uploadedFile}>
                <img src={fileIcons[item.type.split('/')[1]] || fileIcons['default']} alt="" />

                <div className={classes.fileInfo}>
                  <p className={classes.fileName}>{item.name}</p>
                  <p className={classes.fileSize}>{formatBytes(item.size)}</p>
                </div>

                <span className={classes.deleteFile} onClick={() => fileRemove(item)}>
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

export default DragDropFileInput;
