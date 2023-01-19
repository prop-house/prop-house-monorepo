import classes from './ProposalEditor.module.css';
import { Row, Col, Form } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useRef, useState } from 'react';
import { useQuill } from 'react-quilljs';
import clsx from 'clsx';
import QuillEditorModal from '../QuillEditorModal';
import '../../quill.css';
import { useTranslation } from 'react-i18next';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import Modal from '../Modal';
import Button, { ButtonColor } from '../Button';
import DropFileInput from '../DropFileInput';
import BlotFormatter from 'quill-blot-formatter';
import { NounImage } from '../../utils/getNounImage';
import validFile from '../../utils/validFile';
import changeFileExtension from '../../utils/changeFileExtension';
import getInvalidFileMessage from '../../utils/getInvalidFileMessage';

const ProposalEditor: React.FC<{
  fields?: ProposalFields;
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = props => {
  const { fields, onDataChange } = props;
  const data = useAppSelector(state => state.editor.proposal);
  const [blurred, setBlurred] = useState(false);
  const [editorBlurred, setEditorBlurred] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const { t } = useTranslation();

  const { library } = useEthers();
  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);
  const signerless = new PropHouseWrapper('https://prod.backend.prop.house');

  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [successfulUpload, setSuccessfulUpload] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [invalidFileError, setInvalidFileError] = useState(false);
  const [invalidFileMessage, setInvalidFileMessage] = useState('');

  const validateInput = (min: number, count: number) => 0 < count && count < min;

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

  const handleImageUpload = async () => {
    if (!quill) return;
    setLoading(true);
    setInvalidFileMessage('');

    try {
      setSuccessfulUpload(false);

      const res = await Promise.all(
        files.map(async (file: File) => {
          return await signerless.postFile(file, file.name);
        }),
      );

      res.map((r, i) => {
        quill.setSelection(quill.getLength(), 0);
        quill.insertEmbed(
          quill.getSelection()!.index,
          'image',
          `https://prod.backend.prop.house/file/local/hash/${r.data.ipfsHash}`,
          Quill.sources.USER,
        );

        return null;
      });
      setSuccessfulUpload(true);
    } catch (e) {
      setUploadError(true);
      console.log(e);
    }
    setLoading(false);
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
  const linkHandler = () => setShowLinkModal(true);

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
      toolbar.addHandler('link', linkHandler);

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

  // image upload state reset
  const resetImageUploadModal = () => {
    setSuccessfulUpload(false);
    setUploadError(false);
    setFiles([]);
    setInvalidFileMessage('');
    setInvalidFileError(false);
  };
  // when you click outside the modal, reset state & close modal
  const handleDismiss = () => {
    resetImageUploadModal();
    setShowImageUploadModal(false);
  };
  // reset state but keep modal open to upload more
  const handleUploadMore = () => {
    resetImageUploadModal();
    setShowImageUploadModal(true);
  };

  const onFileDrop = (
    event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>,
  ) => {
    setInvalidFileError(false);
    let selectedFiles: File[] = [];

    // check if the event is a drag event or a file input event:
    if ('dataTransfer' in event) {
      // dataTransfer === drag images directly on editor
      event.preventDefault();
      // default behavior is to open the file in the browser

      selectedFiles = Array.from(event.dataTransfer.files || []);
      setShowImageUploadModal(true);
    } else if ('target' in event) {
      // target === upload when the modal is already open
      selectedFiles = Array.from(event.target.files || []);
    }

    const invalidFileTypes: string[] = [];
    // check if any of the files are invalid
    if (Array.from(selectedFiles).some(file => !validFile(file))) {
      setInvalidFileError(true);
      // get the invalid file types
      Array.from(selectedFiles).map((file, i) => {
        if (!validFile(file)) {
          let fileExtension = file.type.split('/')[1];
          // save the invalid file type to show in error message
          invalidFileTypes.push(changeFileExtension(fileExtension));
        }
        return selectedFiles;
      });
      // generate error message:
      //   • Array.from(new Set(invalidFileTypes)) remove duplicate file types before generating error message
      //   • getInvalidFileMessage() is a function that generates the error message
      //   • setInvalidFileMessage saves the error message to state
      setInvalidFileMessage(getInvalidFileMessage(Array.from(new Set(invalidFileTypes))));
    }
    // filter out invalid files
    const validFiles = Array.from(selectedFiles).filter(file => validFile(file));
    // add the valid files to the list
    if (validFiles) {
      const updatedList = [...files, ...validFiles];
      setFiles(updatedList);
    }
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form>
            <Form.Group className={classes.inputGroup}>
              {formData.map(input => {
                return (
                  <div className={classes.inputSection} key={input.title}>
                    <div className={classes.inputInfo}>
                      <Form.Label className={classes.inputLabel}>{input.title}</Form.Label>
                      <Form.Label className={classes.inputChars}>
                        {input.maxCount
                          ? `${input.fieldValue.length}/${input.maxCount}`
                          : input.fieldValue.length}
                      </Form.Label>
                    </div>

                    <Form.Control
                      as={input.type as any}
                      autoFocus={input.focus}
                      maxLength={input.maxCount && input.maxCount}
                      placeholder={input.placeholder}
                      className={clsx(
                        classes.input,
                        input.fieldName === 'what' && classes.descriptionInput,
                      )}
                      onChange={e => {
                        setBlurred(false);
                        onDataChange({ [input.fieldName]: e.target.value });
                      }}
                      value={data && input.fieldValue}
                      onBlur={() => {
                        setBlurred(true);
                      }}
                    />

                    {blurred && validateInput(input.minCount, input.fieldValue.length) && (
                      <p className={classes.inputError}>{input.error}</p>
                    )}
                  </div>
                );
              })}

              <>
                <div className={classes.inputInfo}>
                  <Form.Label className={clsx(classes.inputLabel, classes.descriptionLabel)}>
                    {descriptionData.title}
                  </Form.Label>

                  <Form.Label className={classes.inputChars}>
                    {quill && quill.getText().length - 1}
                  </Form.Label>
                </div>

                <>
                  {/* 
                    When scrolling past the window height the sticky Card header activates, but the header has rounded borders so you still see the borders coming up from the Card body. `hideBorderBox` is a sticky, empty div with a fixed height that hides these borders. 
                  */}
                  <div className="hideBorderBox"></div>
                  <div
                    ref={quillRef}
                    onDrop={onFileDrop}
                    placeholder={descriptionData.placeholder}
                    onBlur={() => {
                      setEditorBlurred(true);
                    }}
                  />

                  {editorBlurred &&
                    quill &&
                    validateInput(descriptionData.minCount, quill.getText().length - 1) && (
                      <p className={classes.inputError}>{descriptionData.error}</p>
                    )}
                </>
              </>
            </Form.Group>
          </Form>
        </Col>
      </Row>

      <QuillEditorModal
        quill={quill}
        Quill={Quill}
        title={t('addLink')}
        subtitle={t('pasteLink')}
        showModal={showLinkModal}
        setShowModal={setShowLinkModal}
        placeholder="ex. https://nouns.wtf/"
        quillModule="link"
      />

      <QuillEditorModal
        quill={quill}
        Quill={Quill}
        title={t('addImage')}
        subtitle={t('pasteImage')}
        showModal={showImageModal}
        setShowModal={setShowImageModal}
        placeholder="ex. https://noun.pics/1.jpg"
        quillModule="image"
      />

      {showImageUploadModal && (
        <Modal
          title={
            uploadError
              ? 'Error Uploading'
              : loading
              ? 'Uploading...'
              : successfulUpload
              ? 'Upload Successful'
              : files.length > 0
              ? 'Ready to upload'
              : 'Upload files'
          }
          subtitle={
            uploadError
              ? `Your ${
                  files.length === 1 ? 'file' : 'files'
                } could not be uploaded. Please try again.`
              : loading
              ? 'Please wait while your files are uploaded.'
              : successfulUpload
              ? `You have uploaded ${files.length}  ${files.length === 1 ? 'file' : 'files'}!`
              : 'Example formats: .jpg, .png, .gif, .svg, and .mov'
          }
          image={uploadError ? NounImage.Cone : successfulUpload ? NounImage.Camera : null}
          setShowModal={setShowImageUploadModal}
          onRequestClose={handleDismiss}
          body={
            uploadError ? null : loading ? (
              <LoadingIndicator />
            ) : successfulUpload ? null : (
              <DropFileInput
                files={files}
                setFiles={setFiles}
                onFileDrop={onFileDrop}
                invalidFileMessage={invalidFileMessage}
                invalidFileError={invalidFileError}
                setInvalidFileError={setInvalidFileError}
              />
            )
          }
          button={
            <Button
              text={t('Close')}
              disabled={loading}
              bgColor={ButtonColor.White}
              onClick={handleDismiss}
            />
          }
          secondButton={
            uploadError ? (
              <Button
                text={'Retry'}
                disabled={loading}
                bgColor={ButtonColor.Purple}
                onClick={handleImageUpload}
              />
            ) : successfulUpload ? (
              <Button
                disabled={loading || files.length === 0}
                text={t('Upload More?')}
                bgColor={ButtonColor.Green}
                onClick={handleUploadMore}
              />
            ) : (
              <Button
                disabled={loading || files.length === 0}
                text={t('Upload')}
                bgColor={ButtonColor.Green}
                onClick={handleImageUpload}
              />
            )
          }
        />
      )}
    </>
  );
};

export default ProposalEditor;
