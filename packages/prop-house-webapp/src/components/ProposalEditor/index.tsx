import classes from "./ProposalEditor.module.css";
import { Row, Col, Form } from "react-bootstrap";
import clsx from "clsx";
import { useAppSelector } from "../../hooks";
import { ProposalFields } from "../../utils/proposalFields";
import { useState } from "react";

const ProposalEditor: React.FC<{
  onDataChange: (data: Partial<ProposalFields>) => void;
}> = (props) => {
  const data = useAppSelector((state) => state.editor.proposal);
  const { onDataChange } = props;
  const [titleCount, setTitleCount] = useState(0);
  const [titleError, setTitleError] = useState(false);
  const [tldrCount, setTldrCount] = useState(0);
  const [tldrError, setTldrError] = useState(false);
  const [whatCount, setWhatCount] = useState(0);
  const [whatError, setWhatError] = useState(false);

  const validateTitle = (input: any) => {
    setTitleError(false);

    if ((0 < input && input < 5) || input > 80) {
      setTitleError(true);
    }
  };
  const validateTldr = (input: any) => {
    setTldrError(false);

    if ((0 < input && input < 10) || input > 120) {
      setTldrError(true);
    }
  };
  const validateWhat = (input: any) => {
    setWhatError(false);

    if (0 < input && input < 120) {
      setWhatError(true);
    }
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <Form>
            <Form.Group className={classes.inputGroup}>
              <div className={classes.inputSection}>
                <div className={classes.inputInfo}>
                  <Form.Label className={classes.inputLabel}>Title</Form.Label>
                  <Form.Label className={classes.inputChars}>
                    {`${titleCount}/80`}
                  </Form.Label>
                </div>
                <Form.Control
                  as="input"
                  maxLength={80}
                  placeholder="Give your proposal a name..."
                  className={classes.input}
                  onChange={(e) => {
                    setTitleCount(e.target.value.length);
                    onDataChange({ title: e.target.value });
                  }}
                  value={data && data.title}
                  isInvalid={titleError}
                  onBlur={() => validateTitle(titleCount)}
                />
                {titleError && (
                  <p className={classes.inputError}>
                    Title must be 5 characters minimum
                  </p>
                )}
              </div>

              <div className={classes.inputSection}>
                <div className={classes.inputInfo}>
                  <Form.Label className={classes.inputLabel}>tl;dr</Form.Label>
                  <Form.Label className={classes.inputChars}>
                    {`${tldrCount}/120`}
                  </Form.Label>
                </div>
                <Form.Control
                  as="input"
                  maxLength={120}
                  placeholder="In the simplest language possible, explain your proposal in one sentence."
                  className={classes.input}
                  onChange={(e) => {
                    setTldrCount(e.target.value.length);
                    onDataChange({ tldr: e.target.value });
                  }}
                  value={data && data.tldr}
                  isInvalid={tldrError}
                  onBlur={() => validateTldr(tldrCount)}
                />
                {tldrError && (
                  <p className={classes.inputError}>
                    TLDR must be 10 characters minimum
                  </p>
                )}
              </div>

              <div className={classes.inputSection}>
                <div className={classes.inputInfo}>
                  <Form.Label className={classes.inputLabel}>
                    Proposal description
                  </Form.Label>
                  <Form.Label className={classes.inputChars}>
                    {`${whatCount}/500`}
                  </Form.Label>
                </div>
                <Form.Control
                  as="textarea"
                  placeholder="Project details: what are you building?&#10;Roadmap: when do you expect to complete it by?&#10;Team: who is building this?&#10;Links: share relevant links to the team and project"
                  className={clsx(classes.input, classes.descriptionInput)}
                  onChange={(e) => {
                    setWhatCount(e.target.value.length);
                    onDataChange({ what: e.target.value });
                  }}
                  value={data && data.what}
                  isInvalid={whatError}
                  onBlur={() => validateWhat(whatCount)}
                />
                {whatError && (
                  <p className={classes.inputError}>
                    Description must be 120 characters minimum
                  </p>
                )}
              </div>
            </Form.Group>
          </Form>
        </Col>
      </Row>
    </>
  );
};

export default ProposalEditor;
