import classes from './ProposalEditor.module.css';
import { Row, Col, Form } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';
import 'react-quill/dist/quill.snow.css';
import { useEffect, useState } from 'react';
import { useQuill } from 'react-quilljs';
import clsx from 'clsx';
import QuillEditorModal from '../QuillEditorModal';
import '../../quill.css';

const ProposalEditor: React.FC<{
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = (props) => {
  const data = useAppSelector((state) => state.editor.proposal);
  const { onDataChange } = props;
  const [blurred, setBlurred] = useState(false);
  const [editorBlurred, setEditorBlurred] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const validateInput = (min: number, count: number) =>
    0 < count && count < min;

  const formData = [
    {
      title: 'Title',
      focus: true,
      type: 'input',
      fieldValue: data.title,
      fieldName: 'title',
      placeholder: 'Give your proposal a name',
      value: '',
      minCount: 5,
      maxCount: 80,
      error: 'Title must be 5 characters minimum',
    },
    {
      title: 'tl;dr',
      type: 'input',
      fieldValue: data.tldr,
      fieldName: 'tldr',
      placeholder:
        'In the simplest language possible, explain your proposal in one sentence',
      value: '',
      minCount: 10,
      maxCount: 120,
      error: 'TLDR must be between 10 & 120 characters',
    },
  ];

  const descriptionData = {
    title: 'Description',
    type: 'textarea',
    fieldValue: data.what,
    fieldName: 'what',
    placeholder:
      'Project details: what are you building?\nRoadmap: when do you expect to complete it by?\nTeam: who is building this?\nLinks: share relevant links to the team and project',
    value: '',
    minCount: 50,
    error: 'Description must be 50 characters minimum',
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

  const imageHandler = () => {
    setShowImageModal(true);
  };
  const linkHandler = () => {
    setShowLinkModal(true);
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ['bold', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ list: 'ordered' }, { indent: '-1' }, { indent: '+1' }],
        ['link'],
        ['image'],
      ],
    },
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

  useEffect(() => {
    if (quill) {
      var toolbar = quill.getModule('toolbar');
      toolbar.addHandler('image', imageHandler);
      toolbar.addHandler('link', linkHandler);

      quill.clipboard.dangerouslyPasteHTML(data.what);

      quill.on('text-change', () => {
        setEditorBlurred(false);

        onDataChange({ what: quill.root.innerHTML });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quill]);

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form>
            <Form.Group className={classes.inputGroup}>
              {formData.map((input) => {
                return (
                  <div className={classes.inputSection} key={input.title}>
                    <div className={classes.inputInfo}>
                      <Form.Label className={classes.inputLabel}>
                        {input.title}
                      </Form.Label>
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
                        input.fieldName === 'what' && classes.descriptionInput
                      )}
                      onChange={(e) => {
                        setBlurred(false);
                        onDataChange({ [input.fieldName]: e.target.value });
                      }}
                      value={data && input.fieldValue}
                      onBlur={() => {
                        setBlurred(true);
                      }}
                    />

                    {blurred &&
                      validateInput(
                        input.minCount,
                        input.fieldValue.length
                      ) && <p className={classes.inputError}>{input.error}</p>}
                  </div>
                );
              })}

              <>
                <div className={classes.inputInfo}>
                  <Form.Label className={classes.inputLabel}>
                    {descriptionData.title}
                  </Form.Label>

                  <Form.Label className={classes.inputChars}>
                    {quill && quill.getText().length - 1}
                  </Form.Label>
                </div>

                <>
                  <div className="hideBorderBox"></div>
                  <div
                    ref={quillRef}
                    placeholder={descriptionData.placeholder}
                    onBlur={() => {
                      setEditorBlurred(true);
                    }}
                  />

                  {editorBlurred &&
                    quill &&
                    validateInput(
                      descriptionData.minCount,
                      quill.getText().length - 1
                    ) && (
                      <p className={classes.inputError}>
                        {descriptionData.error}
                      </p>
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
        title="Add Link"
        subtitle="Please paste the link url"
        showModal={showLinkModal}
        setShowModal={setShowLinkModal}
        placeholder="ex. https://nouns.wtf/"
        quillModule="link"
      />

      <QuillEditorModal
        quill={quill}
        Quill={Quill}
        title="Add Image"
        subtitle="Please paste the image url"
        showModal={showImageModal}
        setShowModal={setShowImageModal}
        placeholder="ex. https://noun.pics/1.jpg"
        quillModule="image"
      />
    </>
  );
};

export default ProposalEditor;
