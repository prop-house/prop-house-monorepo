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
import InputFormGroup from '../InputFormGroup';

const ProposalInputs: React.FC<{
  quill: any;
  quillRef: any;
  formData: FormDataType[];
  descriptionData: any;
  onDataChange: (data: Partial<ProposalFields>) => void;
  onFileDrop: any;
  editorBlurred: boolean;
  setEditorBlurred: (blurred: boolean) => void;
  initReqAmount: number | null;
  remainingBal: number | null;
}> = ({
  quill,
  quillRef,
  formData,
  descriptionData,
  onDataChange,
  editorBlurred,
  setEditorBlurred,
  onFileDrop,
  initReqAmount,
  remainingBal,
}) => {
  console.log(remainingBal);
  const location = useLocation();
  // active round comes from two diff places depending on where inputs are being displayed
  const roundFromLoc = location.state && location.state.auction; // creating new prop
  const roundFromStore = useAppSelector(state => state.propHouse.activeRound); // editing old prop
  const isInfRound = isInfAuction(roundFromLoc ? roundFromLoc : roundFromStore);
  const roundCurrency = roundFromLoc
    ? roundFromLoc.currencyType
    : roundFromStore
    ? roundFromStore.currencyType
    : '';

  const { data: signer } = useSigner();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [blurred, setBlurred] = useState(false);
  const [fundReq, setFundReq] = useState(initReqAmount);

  useEffect(() => {
    client.current = new PropHouseWrapper(host, signer);
  }, [signer, host]);

  const titleAndTldrInputs = (data: any, isTitleSection: boolean = false) => (
    <InputFormGroup
      titleLabel={data.title}
      content={
        <>
          <Form.Control
            as={data.type as any}
            autoFocus={data.focus}
            maxLength={data.maxCount && data.maxCount}
            placeholder={data.placeholder}
            className={clsx(classes.input, data.fieldName === 'what' && classes.descriptionInput)}
            onChange={e => {
              setBlurred(false);
              onDataChange({ [data.fieldName]: e.target.value });
            }}
            value={data && data.fieldValue}
            onBlur={() => {
              setBlurred(true);
            }}
          />
          {blurred && validateInput(data.minCount, data.fieldValue.length) && (
            <p className={classes.inputError}>{data.error}</p>
          )}
        </>
      }
      charsLabel={
        data.maxCount ? `${data.fieldValue.length}/${data.maxCount}` : data.fieldValue.length
      }
      formGroupClasses={isTitleSection ? classes.infRoundTitleSection : ''}
    />
  );

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form className={classes.form}>
            <div className={clsx(isInfRound && classes.infRoundSectionsContainer)}>
              {/** TITLE */}
              {titleAndTldrInputs(formData[0], true)}
              {/** FUNDS REQ */}
              {isInfRound && (
                <InputFormGroup
                  titleLabel="Funds Request"
                  content={
                    <>
                      <Form.Control
                        className={clsx(classes.input, classes.reqAmountInput)}
                        placeholder={roundCurrency}
                        value={fundReq || ''}
                        onChange={e => {
                          setFundReq(Number(e.target.value));
                          onDataChange({ reqAmount: Number(e.target.value) });
                        }}
                        isInvalid={fundReq && remainingBal ? fundReq > remainingBal : false}
                      />
                      <Form.Control.Feedback type="invalid">
                        Exceeds max remaining balance of {remainingBal} {roundCurrency}
                      </Form.Control.Feedback>
                    </>
                  }
                  formGroupClasses={classes.fundReqFormGroup}
                />
              )}
            </div>

            {/** TLDR */}
            {titleAndTldrInputs(formData[1])}

            {/** DESCRIPTION */}

            <InputFormGroup
              titleLabel={descriptionData.title}
              content={
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
              }
              charsLabel={quill && quill.getText().length - 1}
            />
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalInputs;
