import classes from "./RenderedProposalFields.module.css";
import { Row, Col } from "react-bootstrap";
import { ProposalFields } from "../../utils/proposalFields";
import EthAddress from "../EthAddress";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";
import { nameToSlug } from "../../utils/communitySlugs";
import Markdown from "markdown-to-jsx";
import sanitizeHtml from "sanitize-html";

export interface RenderedProposalProps {
  fields: ProposalFields;
  address?: string;
  proposalId?: number;
  backButton?: React.ReactNode;
  community?: any;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = (props) => {
  const { fields, address, proposalId, backButton, community } = props;

  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <div className={classes.headerContainer}>
            {backButton && backButton}

            <div>
              {address && proposalId && (
                <div className={classes.subinfo}>
                  <div className={classes.communityAndPropNumber}>
                    {community && (
                      <Link
                        to={`/${nameToSlug(community.name)}`}
                        className={classes.communityProfImgContainer}
                      >
                        <img
                          src={community.profileImageUrl}
                          alt="community profile "
                          className={classes.communityProfImg}
                        />
                        {community.name.charAt(0).toUpperCase() +
                          community.name.slice(1)}
                      </Link>
                    )}
                    <span>&nbsp;•&nbsp;</span>
                    <span className={classes.propNumber}>#{proposalId} </span>
                  </div>

                  <span className={classes.propSpacer}>&nbsp;•&nbsp;</span>

                  <div className={classes.submittedBy}>
                    by&nbsp;
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
          <Markdown>
            {sanitizeHtml(fields.what, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
              allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat([
                "data",
              ]),
              allowedAttributes: {
                img: ["src", "alt"],
                a: ["href", "target"],
              },
              allowedClasses: {
                code: ["language-*", "lang-*"],
                pre: ["language-*", "lang-*"],
              },
            })}
          </Markdown>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
