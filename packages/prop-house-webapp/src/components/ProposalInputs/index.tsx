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
import { useSigner } from 'wagmi';
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

  // const data = useAppSelector(state => state.editor.proposal);

  const { data: signer } = useSigner();

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  const [blurred, setBlurred] = useState(false);
  const [fundReq, setFundReq] = useState<number | undefined>();

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
      formGroupClasses={
        isTitleSection && fundReqData.isInfRound ? classes.infRoundTitleSection : ''
      }
    />
  );
  // TODO

  // const [successfulUpload, setSuccessfulUpload] = useState<boolean>(false);
  // const [uploadError, setUploadError] = useState<boolean>(false);
  // const [loading, setLoading] = useState<boolean>(false);
  // const signerless = new PropHouseWrapper('https://prod.backend.prop.house');

  // const handleImageUpload = async () => {
  //   if (!quill) return;

  //   setLoading(true);
  //   // setUploadError(false);
  //   // setInvalidFileMessage('');
  //   // console.log('ran in handleImageUpload', files);
  //   try {
  //     setSuccessfulUpload(false);
  //     // console.log('ran 1', files);
  //     const res = await Promise.all(
  //       files.map(async (file: File) => {
  //         return await signerless.postFile(file, file.name);
  //       }),
  //     );
  //     res && console.log('ran 2', res);

  //     res.map((r, i) => {
  //       quill.setSelection(quill.getLength(), 0);
  //       quill.insertEmbed(
  //         quill.getSelection()!.index,
  //         'image',
  //         buildIpfsPath(r.data.ipfsHash),
  //         Quill.sources.USER,
  //       );

  //       console.log('ran 3', buildIpfsPath(r.data.ipfsHash));
  //       return null;
  //     });
  //     console.log('ran 4');
  //     setSuccessfulUpload(true);
  //   } catch (e) {
  //     console.log('ran 5');
  //     setUploadError(true);
  //     console.log(e);
  //   }
  //   setLoading(false);
  // };

  // const base64ImageRegex = /^data:image\/(jpeg|jpg|svg|png|gif);base64,/;

  // const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {

  // if (
  //   clipboardData.types.includes('image/png') ||
  //   clipboardData.types.includes('image/jpeg') ||
  //   clipboardData.types.includes('image/gif') ||
  //   clipboardData.types.includes('image/svg+xml')
  // ) {
  //   const image = new Image();
  //   image.src = URL.createObjectURL(clipboardData.getData('text/plain'));

  //   console.log('image', image);
  // } else {
  //   console.log('No image data in the clipboard');
  // }
  // console.log('files1', files);
  // // Get the pasted content from the clipboard
  // let pastedContent = event.clipboardData;

  // // Perform any necessary actions on the pasted content
  // console.log('pastedContent', pastedContent);

  // Use a regular expression to match image tags in the pasted content
  // let imageTags = pastedContent.match(base64ImageRegex);

  // console.log('imageUrls', imageTags); // output: imageUrls ['<img src="https://lh6.googleusercontent.com/7SZMJa…Tr0Ei1YVk0tJatjIeSsw8s2Yss0qGlSzSvsAdvahX1qrCcUQ"']

  // if (imageTags) {
  //   // Extract the image URLs from the src attributes
  //   let imageUrls = imageTags.map(imgTag =>
  //     imgTag.replace(/<img[^>]+src="/, '').replace(/".*$/, ''),
  //   );

  //   console.log('imageUrls', imageUrls);
  //   // Iterate through the image URLs and upload them to your database
  //   imageUrls.forEach(imageUrl => {
  //     fetch(imageUrl)
  //       .then(response => response.blob())
  //       .then(blob => {
  //         let fileType;
  //         let fileName = 'image.jpg';
  //         let extension = fileName.match(/\.([^.]+)$/);

  //         switch (extension![1]) {
  //           case 'jpg':
  //           case 'jpeg':
  //             fileType = 'image/jpeg';
  //             break;
  //           case 'png':
  //             fileType = 'image/png';
  //             break;
  //           case 'gif':
  //             fileType = 'image/gif';
  //             break;
  //           case 'svg':
  //             fileType = 'image/svg+xml';
  //             break;
  //           default:
  //             //for unknown extension,
  //             fileType = 'unknown';
  //         }

  //         let file = new File([blob], fileName, { type: fileType });
  //         // let file = new File([blob], 'image.jpg', { type: 'image/jpg' });
  //         // const updatedList = [...files, ...file];

  //         // add the valid files to the list
  //         if (file) {
  //           const updatedList = [...files, file];
  //           setFiles(updatedList);
  //         }
  //       });
  //   });

  //   console.log('files2', files);
  // }
  // // console.log('imageUrls', imageTags);

  // handleImageUpload();

  // Remove the image tags from the pasted content
  // pastedContent = pastedContent.replace(/<img[^>]+src="?([^"\s]+)"?\s*\/>/g, '');
  // console.log('pastedContent2', pastedContent);

  // Perform any necessary actions on the pasted content
  // Insert the content into the editor
  // if (quillRef.current) quillRef.current.clipboard.dangerouslyPasteHTML(pastedContent);
  // };
  // TODO TODO TODO
  // TODO TODO TODO
  // TODO TODO TODO
  // TODO TODO TODO
  // TODO TODO TODO
  // const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
  //   const clipboardData = event.clipboardData;
  //   const pastedFiles = clipboardData.files;

  //   console.log('pastedFiles', pastedFiles);
  //   if (pastedFiles.length > 0) {
  //     const file = pastedFiles[0];

  //     const reader = new FileReader();
  //     reader.onload = function (e) {
  //       const data = reader.result as string;
  //       console.log('d', data);

  //       if (data.startsWith('data:')) {
  //         console.log('The data is base64 encoded');
  //         const base64String = data.substring(data.indexOf(',') + 1);
  //         // convert the base64 encoded string to a Blob object
  //         const blob = new Blob([atob(base64String)], { type: file.type });
  //         var myFile = new File([blob], 'name');
  //         console.log('myFile', myFile);

  //         const updatedList = [...files, ...[myFile]];
  //         setFiles(updatedList);

  //         handleImageUpload();
  //       } else {
  //         console.log('The data is not base64 encoded');
  //       }
  //     };
  //     reader.readAsDataURL(file);
  //   }

  //   // if (myFile) {
  //   // const updatedList = [...files, ...myFile];
  //   // setFiles(updatedList);
  //   // }
  // };
  // console.log('files', files);
  // TODO

  const [loading, setLoading] = useState<boolean>(false);

  const uploadImageToServer = async (file: File) => {
    try {
      // upload the image to the server
      const res = await signerless.postFile(file, file.name);

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
    } catch (error) {
      console.error(error);
    }
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
