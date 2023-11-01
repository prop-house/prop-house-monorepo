import classes from './ProposalHeaderAndBody.module.css';
import ProposalContent from '../ProposalContent';
import proposalFields, { ProposalFields } from '../../utils/proposalFields';
import { IoClose } from 'react-icons/io5';
import { Col, Container } from 'react-bootstrap';
import ProposalModalHeader from '../ProposalModalHeader';
import Divider from '../Divider';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import ScrollButton from '../ScrollButton/ScrollButton';
import { useAppDispatch, useAppSelector } from '../../hooks';
import ProposalEditor from '../ProposalEditor';
import { patchProposal } from '../../state/slices/editor';
import validFileType from '../../utils/validFileType';
import getDuplicateFileMessage from '../../utils/getDuplicateFileMessage';
import changeFileExtension from '../../utils/changeFileExtension';
import getInvalidFileTypeMessage from '../../utils/getInvalidFileTypeMessage';
import { Proposal } from '@prophouse/sdk-react';
import { setModalActive } from '../../state/slices/propHouse';

interface ProposalHeaderAndBodyProps {
  currentProposal: Proposal;
  currentPropIndex: number;
  handleDirectionalArrowClick: any;

  hideScrollButton: boolean;
  setHideScrollButton: Dispatch<SetStateAction<boolean>>;
  showVoteAllotmentModal: boolean;
  editProposalMode: boolean;
  setEditProposalMode: (e: any) => void;
  proposals: Proposal[];
}

const ProposalHeaderAndBody: React.FC<ProposalHeaderAndBodyProps> = (
  props: ProposalHeaderAndBodyProps,
) => {
  const {
    currentProposal,
    currentPropIndex,
    handleDirectionalArrowClick,
    hideScrollButton,
    setHideScrollButton,
    showVoteAllotmentModal,
    editProposalMode,
    setEditProposalMode,
    proposals,
  } = props;

  const dispatch = useAppDispatch();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);

  const isFirstProp = currentPropIndex === 1;
  const isLastProp = proposals && currentPropIndex === proposals.length;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [toggleScrollButton, setToggleScrollButton] = useState(false);

  useEffect(() => {
    toggleScrollButton && bottomRef && bottomRef.current?.scrollIntoView({ behavior: 'smooth' });

    setToggleScrollButton(false);
  }, [toggleScrollButton]);

  useEffect(() => {
    setHideScrollButton(false);
    if (
      document.querySelector('#propModal')!.getBoundingClientRect().height >
      document.querySelector('#propContainer')!.getBoundingClientRect().height
    ) {
      setHideScrollButton(true);
    }
    // watch for proposal change to reset scroll button
  }, [proposal, setHideScrollButton]);

  const onDataChange = (data: Partial<ProposalFields>) => {
    dispatch(patchProposal(data));
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
      <Container>
        {/*TODO:  {proposal && (
          <OpenGraphElements
            title={proposal.title}
            description={proposal.body.substring(0, 120)}
            imageUrl={cardServiceUrl(CardType.proposal, proposal.id).href}
          />
        )} */}

        {proposals && (
          <div id="propContainer" className={classes.propContainer}>
            <Col xl={12} className={classes.propCol}>
              <div className={classes.stickyContainer}>
                <ProposalModalHeader
                  backButton={
                    <div
                      className={classes.backToAuction}
                      onClick={() => {
                        setEditProposalMode(false);
                        dispatch(setModalActive(false));
                      }}
                    >
                      <IoClose size={'1.5rem'} />
                    </div>
                  }
                  propIndex={currentPropIndex}
                  numberOfProps={proposals.length}
                  handleDirectionalArrowClick={handleDirectionalArrowClick}
                  isFirstProp={isFirstProp}
                  isLastProp={isLastProp && isLastProp}
                  showVoteAllotmentModal={showVoteAllotmentModal}
                  proposal={currentProposal}
                  editProposalMode={editProposalMode}
                />

                <Divider />
              </div>

              {!hideScrollButton && !editProposalMode && (
                <div className="scrollMoreContainer">
                  <ScrollButton
                    toggleScrollButton={toggleScrollButton}
                    setHideScrollButton={setHideScrollButton}
                    setToggleScrollButton={setToggleScrollButton}
                  />
                </div>
              )}

              {editProposalMode ? (
                <span className="editPropContainer">
                  <ProposalEditor
                    fields={proposalFields(currentProposal)}
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
                    isInfRound={false}
                  />
                </span>
              ) : (
                <ProposalContent fields={proposalFields(currentProposal)} />
              )}

              <div ref={bottomRef} />
            </Col>
          </div>
        )}
      </Container>
    </>
  );
};

export default ProposalHeaderAndBody;
