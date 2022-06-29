import classes from "./RenderedProposalFields.module.css";
import { Row, Col } from "react-bootstrap";
import { ProposalFields } from "../../utils/proposalFields";
import EthAddress from "../EthAddress";
import ReactMarkdown from "react-markdown";

export interface RenderedProposalProps {
  fields: ProposalFields;
  address?: string;
  proposalId?: number;
  backButton?: React.ReactNode;
  communityName?: string;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = (props) => {
  const { fields, address, proposalId, backButton, communityName } = props;
  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <div className={classes.headerContainer}>
            {backButton && backButton}

            <div>
              {address && proposalId && (
                <div className={classes.subinfo}>
                  {communityName &&
                    communityName.charAt(0).toUpperCase() +
                      communityName.slice(1) +
                      " • "}
                  Prop #{proposalId}{" "}
                  <span className={classes.propSpacer}>&nbsp;•&nbsp;</span>
                  <div className={classes.submittedBy}>
                    Submitted by&nbsp;
                    <EthAddress address={address} />
                  </div>
                </div>
              )}

              <h1>{fields.title}</h1>
            </div>
          </div>
          <hr></hr>
          <h2>tl;dr</h2>
          <ReactMarkdown
            className={classes.markdown}
            children={fields.tldr}
          ></ReactMarkdown>
          <h2>Description</h2>
          <ReactMarkdown
            className={classes.markdown}
            children={fields.what}
          ></ReactMarkdown>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
