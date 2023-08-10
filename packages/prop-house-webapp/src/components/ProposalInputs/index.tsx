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
import { FormDataType, FundReqDataType } from '../ProposalEditor';
import inputHasImage from '../../utils/inputHasImage';
import { useWalletClient } from 'wagmi';
import InputFormGroup from '../InputFormGroup';
import buildIpfsPath from '../../utils/buildIpfsPath';
import LoadingIndicator from '../LoadingIndicator';

const ProposalInputs: React.FC<{
  quill: any;
  Quill: any;
  quillRef: any;
  formData: FormDataType[];
  descriptionData: any;
  fundReqData: FundReqDataType;
  onDataChange: (data: Partial<ProposalFields>) => void;
  onFileDrop: any;
  editorBlurred: boolean;
  setEditorBlurred: (blurred: boolean) => void;
}> = props => {
  const {
    quill,
    Quill,
    quillRef,
    formData,
    fundReqData,
    descriptionData,
    onDataChange,
    editorBlurred,
    setEditorBlurred,
    onFileDrop,
  } = props;

  const { data: walletClient } = useWalletClient();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [blurred, setBlurred] = useState(false);
  const [fundReq, setFundReq] = useState<number | undefined>();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, walletClient);
  }, [walletClient, host]);

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
      formGroupClasses={
        isTitleSection && fundReqData.isInfRound ? classes.infRoundTitleSection : ''
      }
    />
  );

  const [loading, setLoading] = useState<boolean>(false);

  const uploadImageToServer = async (file: File) => {
    // upload the image to the server
    const res = await client.current.postFile(file, file.name);

    // insert the image into the editor
    quill.setSelection(quill.getLength(), 0);
    quill.insertEmbed(
      quill.getSelection()!.index,
      'image',
      buildIpfsPath(res.data.ipfsHash),
      Quill.sources.USER,
    );

    // insert a newline after the image
    quill.insertText(quill.getSelection()!.index + 1, '\n\n', Quill.sources.USER);
  };

  // handle images being pasted into the editor by uploading them to the server and inserting the new image url into the editor
  const onPaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    // if the user pastes text, don't do anything
    if (!event.clipboardData.files.length) return;

    // get the files that were pasted
    const pastedFiles = Array.from(event.clipboardData.files);

    // prevents the original, encoded image from being pasted
    event.preventDefault();

    setLoading(true);

    const imagePromises = pastedFiles
      // filter out non-image files
      .filter(file => file.type.startsWith('image'))
      // upload the image to the server
      .map(uploadImageToServer);

    await Promise.all(imagePromises);

    setLoading(false);
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form className={classes.form}>
            <div className={clsx(fundReqData.isInfRound && classes.infRoundSectionsContainer)}>
              {/** TITLE */}
              {titleAndTldrInputs(formData[0], true)}
              {/** FUNDS REQ */}
              {fundReqData.isInfRound && (
                <InputFormGroup
                  titleLabel="Funds Request"
                  content={
                    <>
                      <Form.Control
                        type="number"
                        step="0.1"
                        className={clsx(classes.input, classes.reqAmountInput)}
                        placeholder={fundReqData.roundCurrency}
                        value={fundReq || ''}
                        onChange={e => {
                          const value = Number(e.target.value);
                          const formattedValue = value.toFixed(1);
                          setFundReq(Number(formattedValue));
                          onDataChange({ reqAmount: Number(formattedValue) });
                        }}
                        isInvalid={fundReq ? fundReq > fundReqData.remainingBal : false}
                      />

                      <Form.Control.Feedback type="invalid">
                        {fundReqData.error}
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
                    onPaste={onPaste}
                    placeholder={descriptionData.placeholder}
                    onBlur={() => {
                      setEditorBlurred(true);
                    }}
                  />
                  {loading && (
                    <div className={classes.loadingOverlay}>
                      <LoadingIndicator />
                    </div>
                  )}

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
