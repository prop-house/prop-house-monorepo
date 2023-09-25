import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
import { useTranslation } from 'react-i18next';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import BlotFormatter from 'quill-blot-formatter';
import ImageUploadModal from '../ImageUploadModal';
import ProposalInputs from '../ProposalInputs';
import { useEthersSigner } from '../../hooks/useEthersSigner';

export interface FormDataType {
  title: string;
  focus?: boolean;
  type: 'input';
  fieldValue: string;
  fieldName: string;
  placeholder: string;
  value: string;
  minCount: number;
  maxCount: number;
  error: string;
}

export interface FundReqDataType {
  isInfRound: boolean;
  title: string;
  roundCurrency: string;
  initReqAmount: number;
  remainingBal: number;
  error: string;
}

const ProposalEditor: React.FC<{
  fields?: ProposalFields;
  onDataChange: (data: Partial<ProposalFields>) => void;
  showImageUploadModal?: boolean;
  setShowImageUploadModal: Dispatch<SetStateAction<boolean>>;
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
  onFileDrop: (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => void;
  invalidFileError: boolean;
  setInvalidFileError: Dispatch<SetStateAction<boolean>>;
  invalidFileMessage: string;
  setInvalidFileMessage: Dispatch<SetStateAction<string>>;
  duplicateFile: { error: boolean; name: string };
  setDuplicateFile: Dispatch<SetStateAction<{ error: boolean; name: string }>>;
  remainingBal?: number;
  isInfRound: boolean;
}> = props => {
  const {
    fields,
    onDataChange,
    showImageUploadModal,
    setShowImageUploadModal,
    files,
    setFiles,
    invalidFileError,
    setInvalidFileError,
    invalidFileMessage,
    setInvalidFileMessage,
    duplicateFile,
    setDuplicateFile,
    onFileDrop,
    remainingBal,
    isInfRound,
  } = props;
  const data = useAppSelector(state => state.editor.proposal);
  const [editorBlurred, setEditorBlurred] = useState(false);
  const { t } = useTranslation();
  const signer = useEthersSigner();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const round = useAppSelector(state => state.propHouse.onchainActiveRound);

  // TODO: resolve for currency
  const roundCurreny = 'ETH';

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  const formData: FormDataType[] = [
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

  // TODO: resolve for round currency
  const fundReqData: FundReqDataType = {
    isInfRound: isInfRound,
    title: 'Funds Request',
    roundCurrency: 'roundCurrency',
    initReqAmount: 0,
    remainingBal: remainingBal ? remainingBal : 0,
    error: `Exceeds remaining round balance of ${remainingBal} ${'roundCurrency'}`,
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

      // set the editor content to the data from the store
      quill.root.innerHTML = data.what;

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

  return (
    <>
      <ProposalInputs
        quill={quill}
        Quill={Quill}
        quillRef={quillRef}
        onDataChange={onDataChange}
        onFileDrop={onFileDrop}
        formData={formData}
        descriptionData={descriptionData}
        fundReqData={fundReqData}
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
