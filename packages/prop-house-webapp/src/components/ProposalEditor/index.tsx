import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';
import { useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
import { useTranslation } from 'react-i18next';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import BlotFormatter from 'quill-blot-formatter';
import validFileType from '../../utils/validFileType';
import changeFileExtension from '../../utils/changeFileExtension';
import getInvalidFileTypeMessage from '../../utils/getInvalidFileTypeMessage';
import getDuplicateFileMessage from '../../utils/getDuplicateFileMessage';
import ImageUploadModal from '../ImageUploadModal';
import ProposalInputs from '../ProposalInputs';

const ProposalEditor: React.FC<{
  fields?: ProposalFields;
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = props => {
  const { fields, onDataChange } = props;
  const data = useAppSelector(state => state.editor.proposal);
  const [editorBlurred, setEditorBlurred] = useState(false);
  const { t } = useTranslation();

  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [invalidFileError, setInvalidFileError] = useState(false);
  const [invalidFileMessage, setInvalidFileMessage] = useState('');
  const [duplicateFile, setDuplicateFile] = useState<{ error: boolean; name: string }>({
    error: false,
    name: '',
  });

  const formData = [
    {
      title: t('title'),
      focus: true,
      type: 'input',
      fieldValue: data.title,
      fieldName: 'title',
      placeholder: t('titlePlaceholder'),
      value: '',
      minCount: 5,
      maxCount: 80,
      error: t('titleError'),
    },
    {
      title: t('tldr'),
      type: 'input',
      fieldValue: data.tldr,
      fieldName: 'tldr',
      placeholder: t('tldrPlaceholder'),
      value: '',
      minCount: 10,
      maxCount: 120,
      error: t('tldrError'),
    },
  ];

  const descriptionData = {
    title: t('description'),
    type: 'textarea',
    fieldValue: data.what,
    fieldName: 'what',
    placeholder: t('descriptionPlaceholder'),
    value: '',
    minCount: 50,
    error: t('descriptionError'),
  };

  const formats = [
    'header',
    'bold',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'bullet',
    'link',
    'image',
  ];

  const imageHandler = () => setShowImageUploadModal(true);

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ list: 'ordered' }],
        ['link'],
        ['image'],
      ],
    },
    blotFormatter: {},
    clipboard: {
      matchVisual: false,
    },
  };
  const theme = 'snow';
  const placeholder = descriptionData.placeholder;

  const { quill, quillRef, Quill } = useQuill({
    theme,
    modules,
    formats,
    placeholder,
  });

  if (Quill && !quill) {
    Quill.register('modules/blotFormatter', BlotFormatter);
  }

  useEffect(() => {
    if (quill) {
      var toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', imageHandler);

      // set the placeholder for the link input
      const input = document.querySelector('input[data-link]') as HTMLInputElement;
      input.dataset.link = 'https://prop.house';
      input.placeholder = 'https://prop.house';

      // paste the content back into the editor when going from Preview back to Editor
      quill.clipboard.dangerouslyPasteHTML(data.what);

      quill.on('text-change', (delta: any, oldDelta: any, source: any) => {
        setEditorBlurred(false);
        if (source === 'user') {
          const html = quill.root.innerHTML;
          onDataChange({ what: html });
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill]);

  useEffect(() => {
    if (fields) onDataChange(fields);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <ProposalInputs
        quill={quill}
        quillRef={quillRef}
        onDataChange={onDataChange}
        onFileDrop={onFileDrop}
        formData={formData}
        descriptionData={descriptionData}
        editorBlurred={editorBlurred}
        setEditorBlurred={setEditorBlurred}
      />

      {showImageUploadModal && (
        <ImageUploadModal
          files={files}
          setFiles={setFiles}
          onFileDrop={onFileDrop}
          quill={quill}
          Quill={Quill}
          invalidFileError={invalidFileError}
          setInvalidFileError={setInvalidFileError}
          invalidFileMessage={invalidFileMessage}
          setInvalidFileMessage={setInvalidFileMessage}
          duplicateFile={duplicateFile}
          setDuplicateFile={setDuplicateFile}
          setShowImageUploadModal={setShowImageUploadModal}
        />
      )}
    </>
  );
};

export default ProposalEditor;
