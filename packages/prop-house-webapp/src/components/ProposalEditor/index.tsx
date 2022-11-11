import classes from './ProposalEditor.module.css';
import { Row, Col, Form } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { ProposalFields } from '../../utils/proposalFields';
import { useState } from 'react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../RichTextEditor';

const ProposalEditor: React.FC<{
  fields?: ProposalFields;
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = props => {
  const { fields, onDataChange } = props;
  const data = useAppSelector(state => state.editor.proposal);
  const [blurred, setBlurred] = useState(false);
  // const [editorBlurred, setEditorBlurred] = useState(false);
  const { t } = useTranslation();

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
                  <Form.Label className={classes.inputLabel}>{descriptionData.title}</Form.Label>
                </div>

                <>
                  {/* 
                    When scrolling past the window height the sticky Card header activates, but the header has rounded borders so you still see the borders coming up from the Card body. `hideBorderBox` is a sticky, empty div with a fixed height that hides these borders. 
                  */}
                  {/* <div
                    ref={quillRef}
                    placeholder={descriptionData.placeholder}
                    onBlur={() => {
                      setEditorBlurred(true);
                    }}
                    />
                    
                    {editorBlurred &&
                      quill &&
                      validateInput(descriptionData.minCount, quill.getText().length - 1) && (
                        <p className={classes.inputError}>{descriptionData.error}</p>
                      )} */}
                  <div className="hideBorderBox"></div>
                  <RichTextEditor onDataChange={onDataChange} />
                </>
              </>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalEditor;
