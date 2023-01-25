import classes from './Create.module.css';
import { Row, Col, Container } from 'react-bootstrap';
import Button, { ButtonColor } from '../../components/Button';
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ProposalEditor from '../../components/ProposalEditor';
import Preview from '../Preview';
import { clearProposal, patchProposal } from '../../state/slices/editor';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { Proposal } from '@nouns/prop-house-wrapper/dist/builders';
import { appendProposal } from '../../state/slices/propHouse';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import isAuctionActive from '../../utils/isAuctionActive';
import { ProposalFields } from '../../utils/proposalFields';
import { useTranslation } from 'react-i18next';
import DragAndDrop from '../../components/DragAndDrop';
import getDuplicateFileMessage from '../../utils/getDuplicateFileMessage';
import validFileType from '../../utils/validFileType';
import getInvalidFileTypeMessage from '../../utils/getInvalidFileTypeMessage';
import changeFileExtension from '../../utils/changeFileExtension';
import FundingAmount from '../../components/FundingAmount';
import LoadingIndicator from '../../components/LoadingIndicator';
import ProposalSuccessModal from '../../components/ProposalSuccessModal';
import NavBar from '../../components/NavBar';
import { isValidPropData } from '../../utils/isValidPropData';
import ConnectButton from '../../components/ConnectButton';
import { useAccount } from 'wagmi';

const Create: React.FC<{}> = () => {
  const { library: provider } = useEthers();
  const { address: account } = useAccount();

  const { t } = useTranslation();

  // auction to submit prop to is passed via react-router from propse btn
  const location = useLocation();
  const activeAuction = location.state.auction;
  const activeCommunity = location.state.community;

  const [showPreview, setShowPreview] = useState(false);
  const [propId, setPropId] = useState<null | number>(null);
  const [showProposalSuccessModal, setShowProposalSuccessModal] = useState(false);

  const proposalEditorData = useAppSelector(state => state.editor.proposal);
  const dispatch = useAppDispatch();

  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  const onDataChange = (data: Partial<ProposalFields>) => {
    dispatch(patchProposal(data));
  };

  const submitProposal = async () => {
    if (!activeAuction || !isAuctionActive(activeAuction)) return;

    const proposal = await backendClient.current.createProposal(
      new Proposal(
        proposalEditorData.title,
        proposalEditorData.what,
        proposalEditorData.tldr,
        activeAuction.id,
      ),
    );

    setPropId(proposal.id);
    dispatch(appendProposal({ proposal }));
    dispatch(clearProposal());
    setShowProposalSuccessModal(true);
  };

  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [invalidFileError, setInvalidFileError] = useState(false);
  const [invalidFileMessage, setInvalidFileMessage] = useState('');
  const [duplicateFile, setDuplicateFile] = useState<{ error: boolean; name: string }>({
    error: false,
    name: '',
  });

  // Drag and drop images in the editor or the upload image modal
  const onFileDrop = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    setInvalidFileError(false);
    setDuplicateFile({ error: false, name: '' });

    let selectedFiles: File[] = [];

    // check if the event is a drag event or a file input event:
    if ('dataTransfer' in event) {
      // default behavior is to open file in new browser tab, so we prevent that
      event.preventDefault();

      // event.dataTransfer: images were dragged directly on editor
      selectedFiles = Array.from(event.dataTransfer.files || []);
      setShowImageUploadModal(true);

      // clear the input value so that the same file can be uploaded again
      // only if the file is not already in the queue
      event.dataTransfer.clearData();
    } else if ('target' in event) {
      // event.target: images were dragged or uploaded via the input in the modal
      selectedFiles = Array.from(event.target.files || []);

      // clear the input value so that the same file can be uploaded again
      // only if the file is not already in the queue
      event.target.value = '';
    }

    // store the invalid file types and duplicate file names
    const invalidFileTypes: string[] = [];
    const duplicateFileNames: string[] = [];

    // check if any of the files are invalid
    if (Array.from(selectedFiles).some(file => !validFileType(file))) {
      setInvalidFileError(true);

      // get the invalid file types
      Array.from(selectedFiles).map((file, i) => {
        if (!validFileType(file)) {
          let fileExtension = file.type.split('/')[1];

          // save the invalid file type to show in error message
          invalidFileTypes.push(changeFileExtension(fileExtension));
        }
        return selectedFiles;
      });

      // generate invalid file type error message:
      //   • Array.from(new Set(invalidFileTypes)) remove duplicate file types before generating error message
      //   • getInvalidFileTypeMessage() is a function that generates the error message
      //   • setInvalidFileMessage saves the error message to state
      setInvalidFileMessage(getInvalidFileTypeMessage(Array.from(new Set(invalidFileTypes))));
    }

    // check if any of the files are duplicates
    selectedFiles.forEach(file => {
      // check if the file name is already in the list of files, if it is, add it to the list of duplicate file names
      if (files.find(f => f.name === file.name)) duplicateFileNames.push(file.name);
    });

    // generate duplicate file error message if there are any:
    //   • Array.from(new Set(duplicateFileNames)) remove duplicate file names before generating error message
    //   • getDuplicateFileMessage() is a function that generates the error message
    //   • setDuplicateFile saves the error message to state
    duplicateFileNames.length > 0 &&
      setDuplicateFile({
        error: true,
        name: getDuplicateFileMessage(Array.from(new Set(duplicateFileNames))),
      });

    // filter out invalid  & duplicate files
    const validFiles = Array.from(selectedFiles)
      // filter out invalid files extensions
      .filter(
        file =>
          validFileType(file) &&
          // filter out duplicates
          !files.find(f => f.name === file.name),
      );

    // add the valid files to the list
    if (validFiles) {
      const updatedList = [...files, ...validFiles];
      setFiles(updatedList);
    }
  };

  return (
    <>
      {activeAuction ? (
        <>
          <DragAndDrop
            onFileDrop={onFileDrop}
            showImageUploadModal={showImageUploadModal}
            setShowImageUploadModal={setShowImageUploadModal}
          >
            {showProposalSuccessModal && propId && (
              <ProposalSuccessModal
                setShowProposalSuccessModal={setShowProposalSuccessModal}
                proposalId={propId}
                house={activeCommunity}
                round={activeAuction}
              />
            )}

            <div className="gradientBg">
              <NavBar />
              <Container>
                <h1 className={classes.title}>Creating your proposal for</h1>

                <h1 className={classes.proposalTitle}>
                  <span className={classes.boldLabel}>{activeAuction.title}</span> in the{' '}
                  <span className={classes.boldLabel}>{activeCommunity.name}</span> house
                </h1>

                <span className={classes.fundingCopy}>
                  <span className={classes.boldLabel}>{activeAuction.numWinners}</span> winners will
                  be selected to receive{' '}
                  <span className={classes.boldLabel}>
                    {' '}
                    <FundingAmount
                      amount={activeAuction.fundingAmount}
                      currencyType={activeAuction.currencyType}
                    />
                  </span>
                </span>
              </Container>
            </div>

            <Container>
              <Row>
                <Col xl={12}>
                  {showPreview ? (
                    <Preview />
                  ) : (
                    <ProposalEditor
                      onDataChange={onDataChange}
                      showImageUploadModal={showImageUploadModal}
                      setShowImageUploadModal={setShowImageUploadModal}
                      files={files}
                      setFiles={setFiles}
                      onFileDrop={onFileDrop}
                      invalidFileError={invalidFileError}
                      setInvalidFileError={setInvalidFileError}
                      invalidFileMessage={invalidFileMessage}
                      setInvalidFileMessage={setInvalidFileMessage}
                      duplicateFile={duplicateFile}
                      setDuplicateFile={setDuplicateFile}
                    />
                  )}
                </Col>
              </Row>

              <Row>
                <Col xl={12} className={classes.btnContainer}>
                  <Button
                    text={showPreview ? t('backToEditor') : t('preview')}
                    bgColor={ButtonColor.Pink}
                    onClick={() =>
                      setShowPreview(prev => {
                        return !prev;
                      })
                    }
                    disabled={!isValidPropData(proposalEditorData)}
                  />

                  {showPreview &&
                    (account ? (
                      <Button
                        classNames={classes.actionBtn}
                        text={t('signAndSubmit')}
                        bgColor={ButtonColor.Pink}
                        onClick={submitProposal}
                        disabled={!isValidPropData(proposalEditorData)}
                      />
                    ) : (
                      <Button
                        classNames={classes.actionBtn}
                        bgColor={ButtonColor.Pink}
                        text={t('connectWallet')}
                        onClick={connect}
                      />
                    ))}
                </Col>
              </Row>
            </Container>
          </DragAndDrop>
        </>
      ) : (
        <LoadingIndicator />
      )}
    </>
  );
};

export default Create;
