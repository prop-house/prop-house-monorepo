import { useRef, useState } from 'react';
import classes from './DropFileInput.module.css';
import uploadImg from '../../assets/files/upload.png';
import { imageConfig } from './imageConfig';
import { formatBytes } from '../../utils/formatBytes';
import getInvalidFileMessage from '../../utils/getInvalidFileMessage';
import validFile from '../../utils/validFile';
import changeFileExtension from '../../utils/changeFileExtension';

const DropFileInput: React.FC<{
  files: File[];
  setFiles: (files: File[]) => void;
}> = props => {
  const { files, setFiles } = props;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [invalidFileError, setInvalidFileError] = useState(false);
  const [invalidFileType, setInvalidFileType] = useState('');

  const onDragEnter = () => wrapperRef.current!.classList.add('dragover');
  const onDragLeave = () => wrapperRef.current!.classList.remove('dragover');
  const onDrop = () => wrapperRef.current!.classList.remove('dragover');

  const onFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInvalidFileError(false);
    const selectedFiles = Array.from(e.target.files || []);
    const invalidFileTypes: string[] = [];

    // check if any of the files are invalid
    if (selectedFiles.some(file => !validFile(file))) {
      setInvalidFileError(true);

      // get the invalid file types
      selectedFiles.map((file, i) => {
        if (!validFile(file)) {
          let fileExtension = file.type.split('/')[1];

          // save the invalid file type to show in error message
          invalidFileTypes.push(changeFileExtension(fileExtension));
        }
        return selectedFiles;
      });
      // generate error message
      // setInvalidFileType(getInvalidFileMessage(invalidFileTypes));

      // Array.from(new Set(invalidFileTypes)) remove duplicate file types before generating error message
      // getInvalidFileMessage() is a function that generates the error message
      // setInvalidFileType saves the error message to state
      setInvalidFileType(getInvalidFileMessage(Array.from(new Set(invalidFileTypes))));
    }

    // filter out invalid files
    const validFiles = selectedFiles.filter(file => validFile(file));

    // add the valid files to the list
    if (validFiles) {
      const updatedList = [...files, ...validFiles];
      setFiles(updatedList);
    }
  };

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
          <p>Drag & Drop your files here</p>
          <p className={classes.dropFileInputLabelFiles}>ex. JPG/JPEG, PNG, SVG, GIF, MOV</p>
        </div>

        <input
          type="file"
          multiple
          accept=".jpg, .jpeg, .png, .svg, .gif, .mov"
          onChange={onFileDrop}
        />
      </div>

      {
        <div className={classes.dropFilePreview}>
          <p className={classes.dropFilePreviewTitle}>
            {files.length > 0 ? 'Ready to upload' : 'Please upload your file(s)'}
          </p>
          {invalidFileError && <span className={classes.invalidFile}>{invalidFileType}</span>}

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
