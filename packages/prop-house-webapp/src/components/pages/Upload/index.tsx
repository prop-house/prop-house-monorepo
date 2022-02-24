import { useState } from 'react';
import { useEthers } from '@usedapp/core';
import { useAppSelector } from '../../../hooks';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import Button from '@restart/ui/esm/Button';
import { StoredFile } from '@nouns/prop-house-wrapper/dist/builders';
import buildIpfsPath from '../../../utils/buildIpfsPath';
import classes from './Upload.module.css';

/** commented out to silence warning (unused)
function readFileDataAsBase64(e: any, i: number): Promise<string> {
  const file = e.target.files[i];

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: any) => {
      resolve(event.target.result);
    };

    reader.onerror = (err) => {
      reject(err);
    };

    reader.readAsDataURL(file);
  });
}
 */

const Upload = () => {
  const { account } = useEthers();
  // const [dataUrls, setDataUrls] = useState<string[]>([]);
  const [myFiles, setMyFiles] = useState<StoredFile[]>([]);
  const [file, setFile] = useState<File | undefined>(undefined);
  const backendHost = useAppSelector(
    (state) => state.configuration.backendHost
  );
  const { library: provider } = useEthers();
  let backendClient = new PropHouseWrapper(backendHost, provider?.getSigner());

  const onFileChange = (event: any) => {
    // Update the state
    setFile(event.target.files[0]);
  };

  const onFileUpload = async () => {
    if (!file) return;
    await backendClient.postFile(file, file.name);
    refreshFiles();
  };

  const refreshFiles = async () => {
    if (!account) return;
    setMyFiles(await backendClient.getAddressFiles(account));
  };

  return (
    <>
      <div className={classes.myFiles}>
        <h3>Your files</h3>
        <p>
          If you see a row but no file, your upload succeeded but no image
          Pinata is just being slow
        </p>
        {myFiles.map((file, i) => (
          <div key={i}>
            <h4>{file.name}</h4>
            <div className={classes.placeholder}>
              <img src={buildIpfsPath(file.ipfsHash)} alt="uploaded file" />
            </div>
            <p>Copyable markdown:</p>
            <pre>![]({buildIpfsPath(file.ipfsHash)})</pre>
          </div>
        ))}
      </div>
      <div>
        {account && (
          <Button
            onClick={async () => {
              refreshFiles();
            }}
          >
            Fetch Your Files
          </Button>
        )}
      </div>
      <div>
        <h3>Upload New File:</h3>
        <p>
          Only accepts PNGs and JPEGs.{' '}
          <b>Every file you upload will be public!</b>
        </p>
        <input
          accept="image/png, image/jpeg"
          type="file"
          onChange={onFileChange}
        />
        <Button onClick={onFileUpload}>Upload!</Button>
      </div>
      {/* {this.fileData()} */}
    </>
  );
};

export default Upload;
