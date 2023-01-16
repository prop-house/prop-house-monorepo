import { useRef } from 'react';
import classes from './DropFileInput.module.css';
import uploadImg from '../../assets/files/upload.png';
import { imageConfig } from './imageConfig';
import { formatBytes } from '../../utils/formatBytes';

const DropFileInput: React.FC<{
  files: File[];
  setFiles: (files: File[]) => void;
}> = props => {
  const { files, setFiles } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);

  const onDragEnter = () => wrapperRef.current!.classList.add('dragover');
  const onDragLeave = () => wrapperRef.current!.classList.remove('dragover');
  const onDrop = () => wrapperRef.current!.classList.remove('dragover');

  const onFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles) {
      const updatedList = [...files, ...selectedFiles];
      setFiles(updatedList);
    }
  };

  const fileRemove = (file: File) => {
    const updatedList = [...files];
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
          <p>Drag & Drop your files here</p>
        </div>

        <input
          type="file"
          multiple
          accept=".jpg, .jpeg, .png, .svg, .gif, .mov"
          onChange={onFileDrop}
        />
      </div>

      {files.length > 0 ? (
        <div className={classes.dropFilePreview}>
          <p className={classes.dropFilePreviewTitle}>Ready to upload</p>

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
