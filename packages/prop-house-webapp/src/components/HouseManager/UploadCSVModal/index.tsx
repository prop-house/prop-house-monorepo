import classes from './UploadCSVModal.module.css';
import React, { Dispatch, SetStateAction, CSSProperties, useState } from 'react';
// import Button, { ButtonColor } from '../Button';
// import { useTranslation } from 'react-i18next';
import Modal from '../../Modal';
import { NounImage } from '../../../utils/getNounImage';
import { CSVRow } from '../VotingStrategies';
import Text from '../Text';
// @ts-ignore
import { useCSVReader, lightenDarkenColor, formatFileSize } from 'react-papaparse';
import Group from '../Group';

const GREY = '#CCC';
const GREY_LIGHT = 'rgba(255, 255, 255, 0.4)';
const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(DEFAULT_REMOVE_HOVER_COLOR, 40);
const GREY_DIM = '#686868';

const styles = {
  zone: {
    alignItems: 'center',
    border: `2px dashed ${GREY}`,
    borderRadius: 20,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'center',
    padding: 20,
  } as CSSProperties,
  file: {
    background: 'linear-gradient(to bottom, #EEE, #DDD)',
    borderRadius: 20,
    display: 'flex',
    height: 120,
    width: 120,
    position: 'relative',
    zIndex: 10,
    flexDirection: 'column',
    justifyContent: 'center',
  } as CSSProperties,
  info: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: 10,
    paddingRight: 10,
  } as CSSProperties,
  size: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    marginBottom: '0.5em',
    justifyContent: 'center',
    display: 'flex',
  } as CSSProperties,
  name: {
    backgroundColor: GREY_LIGHT,
    borderRadius: 3,
    fontSize: 12,
    marginBottom: '0.5em',
  } as CSSProperties,
  progressBar: {
    bottom: 14,
    position: 'absolute',
    width: '100%',
    paddingLeft: 10,
    paddingRight: 10,
  } as CSSProperties,
  zoneHover: {
    borderColor: GREY_DIM,
  } as CSSProperties,
  default: {
    borderColor: GREY,
  } as CSSProperties,
  remove: {
    height: 23,
    position: 'absolute',
    right: 6,
    top: 6,
    width: 23,
  } as CSSProperties,
};

const UploadCSVModal: React.FC<{
  setShowUploadCSVModal: Dispatch<SetStateAction<boolean>>;
  handleUpload: (data: CSVRow[], type: 'contract' | 'user') => void;
  type: 'contract' | 'user';
}> = props => {
  const { setShowUploadCSVModal, handleUpload, type } = props;
  // const { t } = useTranslation();

  const { CSVReader } = useCSVReader();
  const [zoneHover, setZoneHover] = useState(false);
  const [removeHoverColor, setRemoveHoverColor] = useState(DEFAULT_REMOVE_HOVER_COLOR);
  const isContract = type === 'contract';

  const exampleData = isContract
    ? 'data:text/csv;charset=utf-8,address,votes\n0x9c8ff314c9bc7f6e59a9d9225fb22946427edc03,1\n0x4b10701bfd7bfedc47d50562b76b436fbb5bdb3b,5\n0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7,10'
    : 'data:text/csv;charset=utf-8,address,votes\n0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045,1\n0xD19BF5F0B785c6f1F6228C72A8A31C9f383a49c4,5\n0xF296178d553C8Ec21A2fBD2c5dDa8CA9ac905A00,10';

  const handleFileUpload = (csvFile: any) => {
    const parsedData = csvFile.data.map((row: any) => ({
      address: row[0],
      votes: parseInt(row[1], 10),
    }));

    const formattedData: CSVRow[] = parsedData
      .slice(1)
      .filter((row: CSVRow) => row.address && row.votes)
      .map((row: CSVRow) => ({ address: row.address, votes: row.votes }));

    handleUpload(formattedData, type);
  };

  const data = (
    <div>
      <CSVReader
        onUploadAccepted={(results: any) => {
          setZoneHover(false);
          handleFileUpload(results);
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
        {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps, Remove }: any) => (
          <>
            <div
              {...getRootProps()}
              style={Object.assign({}, styles.zone, zoneHover && styles.zoneHover)}
            >
              {acceptedFile ? (
                <>
                  <div style={styles.file}>
                    <div style={styles.info}>
                      <span style={styles.size}>{formatFileSize(acceptedFile.size)}</span>
                      <span style={styles.name}>{acceptedFile.name}</span>
                    </div>
                    <div style={styles.progressBar}>
                      <ProgressBar />
                    </div>
                    <div
                      {...getRemoveFileProps()}
                      style={styles.remove}
                      onMouseOver={(event: Event) => {
                        event.preventDefault();
                        setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                      }}
                      onMouseOut={(event: Event) => {
                        event.preventDefault();
                        setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                      }}
                    >
                      <Remove color={removeHoverColor} />
                    </div>
                  </div>
                </>
              ) : (
                'Drop CSV file here or click to upload'
              )}
            </div>
          </>
        )}
      </CSVReader>

      <Group mt={6}>
        <a
          href={exampleData}
          download={isContract ? 'contracts.csv' : 'users.csv'}
          className={classes.example}
        >
          <Text type="link">
            Download example: <em>{isContract ? 'contracts.csv' : 'users.csv'}</em>{' '}
          </Text>{' '}
        </a>
      </Group>
    </div>
  );

  return (
    <Modal
      setShowModal={setShowUploadCSVModal}
      title={isContract ? 'Upload Contracts' : 'Upload Users'}
      subtitle={'Upload a CSV file with addresses and voting power.'}
      image={NounImage.Chart}
      body={data}
    />
  );
};

export default UploadCSVModal;
