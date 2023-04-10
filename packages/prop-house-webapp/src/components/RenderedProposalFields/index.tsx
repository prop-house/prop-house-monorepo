import classes from './RenderedProposalFields.module.css';
import { Row, Col } from 'react-bootstrap';
import proposalFields from '../../utils/proposalFields';
import EthAddress from '../EthAddress';
import ReactMarkdown from 'react-markdown';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useTranslation } from 'react-i18next';
import { StoredAuctionBase, StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { BiAward } from 'react-icons/bi';

export interface RenderedProposalProps {
  proposal: StoredProposal;
  backButton?: React.ReactNode;
  community?: any;
  round?: StoredAuctionBase;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = props => {
  const { proposal, backButton, round } = props;
  const { t } = useTranslation();
  const fields = proposalFields(proposal);

  console.log('round from rednered fields:  ', round);

  return (
    <>
      <Row>
        <Col xl={12} className="proposalCopy">
          <div className={classes.headerContainer}>
            <div className={classes.backBtnContainer}>{backButton && backButton}</div>
            <div className={classes.headerBottomContainer}>
              <div>
                {proposal.address && proposal.id && (
                  <div className={classes.subinfo}>
                    <div className={classes.propBy}>
                      <span>{t('propCap')}</span>
                      {t('by')}
                      <div className={classes.submittedBy}>
                        <EthAddress address={proposal.address} className={classes.submittedBy} />
                      </div>
                    </div>
                  </div>
                )}
                <h1>{fields.title}</h1>
              </div>
              {proposal.reqAmount && round && (
                <div className={classes.fundReq}>
                  <BiAward size={'1.8rem'} />
                  {`${proposal.reqAmount} ${round?.currencyType}`}
                </div>
              )}
            </div>
          </div>

          <span className={classes.proposalBody}>
            {fields.tldr && (
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
              {sanitizeHtml(fields.what, {
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
              })
                // edge case: handle ampersands in img links encoded from sanitization
                .replaceAll('&amp;', '&')
                // Pinata requires crossorigin attribute on images
                .replaceAll(/<img/g, '<img crossorigin="anonymous"')}
            </Markdown>
          </span>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
