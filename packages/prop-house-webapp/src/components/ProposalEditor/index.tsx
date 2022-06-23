import classes from "./ProposalEditor.module.css";
import { Row, Col, Form } from "react-bootstrap";
import { useAppSelector } from "../../hooks";
import { ProposalFields } from "../../utils/proposalFields";
import "react-quill/dist/quill.snow.css";
import { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";

import clsx from "clsx";

const ProposalEditor: React.FC<{
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = (props) => {
  const data = useAppSelector((state) => state.editor.proposal);
  const { onDataChange } = props;
  const [blurred, setBlurred] = useState(false);
  const [editorBlurred, setEditorBlurred] = useState(false);

  const validateInput = (min: number, count: number) =>
    0 < count && count < min;

  const formData = [
    {
      title: "Title",
      focus: true,
      type: "input",
      fieldValue: data.title,
      fieldName: "title",
      placeholder: "Give your proposal a name",
      value: "",
      minCount: 5,
      maxCount: 100,
      error: "Title must be 5 characters minimum",
    },
    {
      title: "tl;dr",
      type: "input",
      fieldValue: data.tldr,
      fieldName: "tldr",
      placeholder:
        "In the simplest language possible, explain your proposal in one sentence",
      value: "",
      minCount: 10,
      maxCount: 120,
      error: "TLDR must be between 10 & 120 characters",
    },
  ];

  const descriptionData = {
    title: "Description",
    type: "textarea",
    fieldValue: data.what,
    fieldName: "what",
    placeholder:
      "Project details: what are you building?\nRoadmap: when do you expect to complete it by?\nTeam: who is building this?\nLinks: share relevant links to the team and project",
    value: "",
    minCount: 50,
    error: "Description must be 50 characters minimum",
  };

  const formats = [
    "header",
    "bold",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "link",
    "image",
  ];
  const imageHandler = () => {
    var range = quill!.getSelection();
    var value = prompt("please copy paste the image url here.");

    if (value) {
      quill!.insertEmbed(range!.index, "image", value, Quill.sources.USER);
    }
  };

  const modules = {
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "underline", "strike", "blockquote", "code-block"],
        [{ list: "ordered" }, { indent: "-1" }, { indent: "+1" }],
        ["link"],
        ["image"],
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };
  const theme = "snow";
  const placeholder = descriptionData.placeholder;

  const { quill, quillRef, Quill } = useQuill({
    theme,
    modules,
    formats,
    placeholder,
  });

  useEffect(() => {
    if (quill) {
      var toolbar = quill.getModule("toolbar");
      toolbar.addHandler("image", imageHandler);

      quill.clipboard.dangerouslyPasteHTML(data.what);

      quill.on("text-change", () => {
        setEditorBlurred(false);

        onDataChange({ what: quill.root.innerHTML });
      });
    }
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
                        input.fieldName === "what" && classes.descriptionInput
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
                  <button type="button" onClick={imageHandler}>
                    TEST
                  </button>
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
                      quill.getText().length
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
    </>
  );
};

export default ProposalEditor;
