import classes from './UploadCSVModal.module.css';
import React, { Dispatch, SetStateAction, useState } from 'react';
import Modal from '../../Modal';
import { NounImage } from '../../../utils/getNounImage';
import Text from '../Text';
// import { useCSVReader, lightenDarkenColor } from 'react-papaparse';
import { useCSVReader } from 'react-papaparse';
import Group from '../Group';
import Button, { ButtonColor } from '../../Button';
import clsx from 'clsx';
import { formatBytes } from '../../../utils/formatBytes';
import { fileIcons } from '../../DragDropFileInput';
import Divider from '../../Divider';

export interface CSVRow {
  address: string;
  votes: number;
}

// const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
// const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(DEFAULT_REMOVE_HOVER_COLOR, 40);

const UploadCSVModal: React.FC<{
  handleUpload: (data: CSVRow[]) => void;
  setShowUploadCSVModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { handleUpload, setShowUploadCSVModal } = props;

  const [csvData, setCSVData] = useState<CSVRow[]>([]);

  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [readyToUpload, setReadyToUpload] = useState(false);
  const [fileTypeError, setFileTypeError] = useState(false);
  // const [removeHoverColor, setRemoveHoverColor] = useState(DEFAULT_REMOVE_HOVER_COLOR);
  // const isContract = type === 'contract';

  const exampleData =
    'data:text/csv;charset=utf-8,address,votes\n0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03,1\n0x4b10701bfd7bfedc47d50562b76b436fbb5bdb3b,5\n0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7,10\n0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,1\n0xD19BF5F0B785c6f1F6228C72A8A31C9f383a49c4,5\n0xF296178d553C8Ec21A2fBD2c5dDa8CA9ac905A00,10';

  const handleFileUpload = (csvFile: any) => {
    // Parse the CSV data into an array of objects with 'address' and 'votes' properties
    const parsedData = csvFile.data.map((row: any) => ({
      address: row[0], // Get the first column (address) from each row
      votes: parseInt(row[1], 10), // Get the second column (votes) from each row and parse it as an integer
    }));

    // Process the parsed data to create a formatted array of CSVRow objects
    const formattedData: CSVRow[] = parsedData
      .slice(1) // Remove the header row (i.e., 'address, votes') from the parsed data
      .filter((row: CSVRow) => row.address && row.votes) // Filter out any rows with missing or invalid address and votes data
      .map((row: CSVRow) => ({ address: row.address, votes: row.votes })); // Create a new array with the filtered and valid CSVRow objects

    setCSVData(formattedData);

    setReadyToUpload(true);
  };

  const data = (
    <Group mt={12}>
      <CSVReader
        onUploadAccepted={(results: any) => {
          if (fileTypeError) setFileTypeError(false);

          setZoneHover(false);
          handleFileUpload(results);
        }}
        onUploadRejected={(err: any) => {
          if (readyToUpload) setReadyToUpload(false);

          setFileTypeError(true);
        }}
        onDragOver={(event: DragEvent) => {
          event.preventDefault();
          setZoneHover(true);
        }}
        onDragLeave={(event: DragEvent) => {
          event.preventDefault();
          setZoneHover(false);
        }}
      >
        {({ getRootProps, acceptedFile }: any) => (
          <>
            {!readyToUpload ? (
              <div
                {...getRootProps()}
                className={clsx(
                  classes.zone,
                  readyToUpload && classes.zoneAccepted,
                  fileTypeError && classes.zoneError,
                  zoneHover && classes.zoneHover,
                )}
              >
                <div>
                  <div className={classes.inputLabelContainer}>
                    <img
                      className={classes.uploadImagePicture}
                      src={NounImage.Chart.src}
                      alt={NounImage.Chart.alt}
                    />

                    <p className={classes.inputLabelTitle}>
                      {fileTypeError ? 'Invalid file type' : 'Drag & drop your CSV file here'}
                    </p>
                    <p className={classes.inputLabelSubtitle}>
                      {fileTypeError ? 'Please use a .csv' : 'or click to browse'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Divider noMarginDown />
                <div className={classes.uploadedFilesContainer}>
                  <p className={classes.uploadReadyTitle}>Ready to upload</p>

                  <div className={classes.uploadedFile}>
                    <img src={fileIcons['csv']} alt="csv" />

                    <div className={classes.fileInfo}>
                      <p className={classes.fileName}>{acceptedFile.name}</p>
                      <p className={classes.fileSize}>{formatBytes(acceptedFile.size)}</p>
                    </div>

                    <span className={classes.deleteFile} onClick={handleRemoveFile}>
                      x
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CSVReader>

      {!readyToUpload && (
        <Group mt={6}>
          <a href={exampleData} download="example.csv" className={classes.example}>
            <Text type="link">
              Download <em>example.csv</em>{' '}
            </Text>{' '}
          </a>
        </Group>
      )}
    </Group>
  );

  const handleRemoveFile = () => {
    setReadyToUpload(false);
    setFileTypeError(false);
    setCSVData([]);
  };

  const handleCancel = () => {
    handleRemoveFile();
    setShowUploadCSVModal(false);
  };

  return (
    <Modal
      modalProps={{
        setShowModal: setShowUploadCSVModal,
        title: 'Add Voters',
        subtitle: 'Upload a CSV file with addresses and voting power.',
        handleClose: handleCancel,
        body: data,
        button: (
          <Button
            text={'Upload'}
            disabled={!readyToUpload}
            bgColor={ButtonColor.Green}
            onClick={() => handleUpload(csvData)}
          />
        ),
      }}
    />
  );
};

export default UploadCSVModal;
