import classes from './ProposalContent.module.css';
import { ProposalFields } from '../../utils/proposalFields';
import ReactMarkdown from 'react-markdown';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useTranslation } from 'react-i18next';
import { replaceIpfsGateway } from '../../utils/ipfs';

export interface ProposalContentProps {
  fields: ProposalFields;
  roundCurrency?: string;
}

const ProposalContent: React.FC<ProposalContentProps> = props => {
  const { fields } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="proposalCopy">
        <span className={classes.proposalBody}>
          {/** todo: resolves for req amounts when sdk provides it */}
          {/* {fields.reqAmount && (
            <>
              <h2>Funds requested</h2>
              <p>
                {fields.reqAmount} {roundCurrency}
              </p>
            </>
          )} */}
          {fields.tldr && (
            <>
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
            {replaceIpfsGateway(
              sanitizeHtml(fields.what, {
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
                // Handle ampersands in img links encoded from sanitization and
                // add crossorigin attribute on images for Pinata
              }).replaceAll('&amp;', '&').replaceAll(/<img/g, '<img crossorigin="anonymous"')
            )}
          </Markdown>
        </span>
      </div>
    </>
  );
};

export default ProposalContent;
