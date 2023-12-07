import classes from './RenderedProposalFields.module.css';
import { Row, Col, Container } from 'react-bootstrap';
import proposalFields from '../../utils/proposalFields';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useTranslation } from 'react-i18next';
import { pipe } from 'ramda';
import { replaceIpfsGateway } from '../../utils/ipfs';
import { ProposalWithTldr } from '../../types/ProposalWithTldr';

export interface RenderedProposalProps {
  proposal: ProposalWithTldr;
  backButton?: React.ReactNode;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = props => {
  const { proposal, backButton } = props;
  const { t } = useTranslation();
  const fields = proposalFields(proposal);

  return (
    <Container>
      <Row>
        <Col xl={12} className="proposalCopy">
          <div className={classes.headerContainer}>
            <div className={classes.backBtnContainer}>{backButton && backButton}</div>
            <div className={classes.headerBottomContainer}>
              <div>
                {proposal.proposer && proposal.id && (
                  <div className={classes.subinfo}>
                    <div className={classes.propBy}>
                      <span>{t('propCap')}</span>
                      {t('by')}
                      <div className={classes.submittedBy}>
                        <EthAddress address={proposal.proposer} className={classes.submittedBy} />
                      </div>
                    </div>
                  </div>
                )}
                <h1>{fields.title}</h1>
              </div>
              {/** TODO: adapt to inf rounds */}
              {/* {proposal.reqAmount && round && (
                <div className={classes.fundReq}>
                  <BiAward size={'1.8rem'} />
                  {`${proposal.reqAmount} ${round?.currencyType}`}
                </div>
              )} */}
            </div>
          </div>

          <span className={classes.proposalBody}>
            {fields.what.substring(0, 120) && (
              <>
                <hr></hr>
                <h2>{t('tldr')}</h2>
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
              {pipe(
                (whatText: string) =>
                  sanitizeHtml(whatText, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
                    allowedSchemes: sanitizeHtml.defaults.allowedSchemes.concat(['data']),
                    allowedAttributes: {
                      img: ['src', 'alt', 'height', 'width'],
                      a: ['href', 'target'],
                    },
                    allowedClasses: {
                      code: ['language-*', 'lang-*'],
                      pre: ['language-*', 'lang-*'],
                    },
                  }),
                // edge case: handle ampersands in img links encoded from sanitization
                (whatText: string) => whatText.replaceAll('&amp;', '&'),
                // Pinata requires crossorigin attribute on images
                (whatText: string) => whatText.replaceAll(/<img/g, '<img crossorigin="anonymous"'),
                (whatText: string) => replaceIpfsGateway(whatText),
              )(fields.what)}
            </Markdown>
          </span>
        </Col>
      </Row>
    </Container>
  );
};

export default RenderedProposalFields;
