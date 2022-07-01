import classes from "./ProposalEditor.module.css";
import { Row, Col, Form } from "react-bootstrap";
import { useAppSelector } from "../../hooks";
import { ProposalFields } from "../../utils/proposalFields";
import { useState } from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

const ProposalEditor: React.FC<{
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = (props) => {
  const data = useAppSelector((state) => state.editor.proposal);
  const { onDataChange } = props;
  const [blurred, setBlurred] = useState(false);
  const { t } = useTranslation();

  const validateInput = (min: number, count: number) =>
    0 < count && count < min;

  const formData = [
    {
      title: t("title"),
      type: "input",
      fieldValue: data.title,
      fieldName: "title",
      placeholder: t("titlePlaceholder"),
      value: "",
      minCount: 5,
      maxCount: 100,
      error: t("titleError"),
    },
    {
      title: t("tldr2"),
      type: "input",
      fieldValue: data.tldr,
      fieldName: "tldr",
      placeholder: t("tldrPlaceholder"),
      value: "",
      minCount: 10,
      maxCount: 120,
      error: t("tldrError"),
    },
    {
      title: t("description"),
      type: "textarea",
      fieldValue: data.what,
      fieldName: "what",
      placeholder: t("descriptionPlaceholder"),
      value: "",
      minCount: 50,
      error: t("descriptionError"),
    },
  ];

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form>
            <Form.Group className={classes.inputGroup}>
              {formData.map((input) => {
                return (
                  <div className={classes.inputSection}>
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
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalEditor;
