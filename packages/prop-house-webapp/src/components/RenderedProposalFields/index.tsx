import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import { ProposalFields } from '../../utils/proposalFields';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import { nameToSlug } from '../../utils/communitySlugs';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useTranslation } from 'react-i18next';

export interface RenderedProposalProps {
  fields: ProposalFields;
  address?: string;
  proposalId?: number;
  backButton?: React.ReactNode;
  community?: any;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = props => {
  const { fields, address, proposalId, backButton, community } = props;
  const { t } = useTranslation();

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
                    <span className={classes.propNumber}>Prop #{proposalId} </span>
                  </div>

                  <span className={classes.propSubmissionData}>
                    <div className={classes.submittedBy}>
                      by
                      <EthAddress
                        address={address}
                        hideDavatar={true}
                        className={classes.submittedBy}
                      />
                    </div>
                    <span className={classes.textSpacer}>{'in the '}</span>

                    {community && (
                      <Link
                        to={`/${nameToSlug(community.name)}`}
                        className={classes.communityProfImgContainer}
                      >
                        {community.name.charAt(0).toUpperCase() + community.name.slice(1)}
                        &nbsp;house
                      </Link>
                    )}
                  </span>
                </div>
              )}

              <h1>{fields.title}</h1>
            </div>
          </div>

          {fields.tldr && (
            <>
              <hr></hr>
              <h2>{t('tldr2')}</h2>
              <ReactMarkdown className={classes.markdown} children={fields.tldr}></ReactMarkdown>
            </>
          )}

          <h2>{t('description')}</h2>
          {/*
           * We sanitize HTML coming from rich text editor to prevent xss attacks.
           *
           * <Markdown/> component used to render HTML, while supporting Markdown.
           */}
          <Markdown>
            {sanitizeHtml(fields.what, {
              allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
              allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(['data']),
              allowedAttributes: {
                img: ['src', 'alt'],
                a: ['href', 'target'],
              },
              allowedClasses: {
                code: ['language-*', 'lang-*'],
                pre: ['language-*', 'lang-*'],
              },
              // edge case: handle ampersands in img links encoded from sanitization
            }).replaceAll('&amp;', '&')}
          </Markdown>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
