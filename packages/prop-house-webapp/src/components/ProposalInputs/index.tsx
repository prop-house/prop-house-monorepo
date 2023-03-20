import classes from './ProposalInputs.module.css';
import { useEffect, useRef, useState } from 'react';
import { Row, Col, Form } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import 'react-quill/dist/quill.snow.css';
import '../../quill.css';
import clsx from 'clsx';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import validateInput from '../../utils/validateInput';
import { ProposalFields } from '../../utils/proposalFields';
import { FormDataType } from '../ProposalEditor';
import inputHasImage from '../../utils/inputHasImage';
import { isInfAuction } from '../../utils/auctionType';
import { useLocation } from 'react-router-dom';
import { useSigner } from 'wagmi';

const ProposalInputs: React.FC<{
  quill: any;
  quillRef: any;
  formData: any;
  descriptionData: any;
  onDataChange: (data: Partial<ProposalFields>) => void;
  onFileDrop: any;
  editorBlurred: boolean;
  setEditorBlurred: (blurred: boolean) => void;
  initReqAmount: number | null;
}> = props => {
  const {
    quill,
    quillRef,
    formData,
    descriptionData,
    onDataChange,
    editorBlurred,
    setEditorBlurred,
    onFileDrop,
    initReqAmount,
  } = props;
  const location = useLocation();
  // active round comes from two diff places depending on where inputs are being displayed
  const roundFromLoc = location.state && location.state.auction; // creating new prop
  const roundFromStore = useAppSelector(state => state.propHouse.activeRound); // editing old prop
  const isInfRound = isInfAuction(roundFromLoc ? roundFromLoc : roundFromStore);

  const data = useAppSelector(state => state.editor.proposal);
  const { data: signer } = useSigner();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [blurred, setBlurred] = useState(false);
  const [fundReq, setFundReq] = useState(initReqAmount);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  const maxFundingReq = 100;
  return (
    <>
      <Row>
        <Col xl={12}>
          <Form className={classes.form}>
            {formData.map((input: FormDataType, index: number) => {
              return (
                <div className={isInfRound && index === 0 ? classes.infRoundSectionsContainer : ''}>
                  <Form.Group
                    className={clsx(
                      classes.inputGroup,
                      isInfRound && index === 0 ? classes.infRoundTitleSection : '',
                    )}
                  >
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
                  </Form.Group>
                  {isInfRound && index === 0 && (
                    <Form.Group className={classes.inputGroup}>
                      <div className={classes.inputSection} key={input.title}>
                        <div className={classes.inputInfo}>
                          <Form.Label className={classes.inputLabel}>Funds Request</Form.Label>
                        </div>
                        <Form.Control
                          type="number"
                          className={clsx(classes.input, classes.reqAmountInput)}
                          value={fundReq || ''}
                          onChange={e => {
                            setFundReq(Number(e.target.value));
                            onDataChange({ reqAmount: Number(e.target.value) });
                          }}
                        />
                        <Form.Control.Feedback type="invalid">
                          Exceeds max amount of {1}
                        </Form.Control.Feedback>
                      </div>
                    </Form.Group>
                  )}
                </div>
              );
            })}

            <Form.Group>
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
                  !inputHasImage(descriptionData.fieldValue) &&
                  validateInput(descriptionData.minCount, quill.getText().length - 1) && (
                    <p className={classes.inputError}>{descriptionData.error}</p>
                  )}
              </>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalInputs;
