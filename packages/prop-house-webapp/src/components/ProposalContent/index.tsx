import classes from './ProposalContent.module.css';
import { ProposalFields } from '../../utils/proposalFields';
import ReactMarkdown from 'react-markdown';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useTranslation } from 'react-i18next';
import pipe from 'ramda/src/pipe';
import { injectIpfsGateway, ipfsImageSrcRegex } from '../../utils/ipfs';

export interface ProposalContentProps {
  fields: ProposalFields;
  roundCurrency?: string;
}

const ProposalContent: React.FC<ProposalContentProps> = props => {
  const { fields, roundCurrency } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className="proposalCopy">
        <span className={classes.proposalBody}>
          {fields.reqAmount && (
            <>
              <h2>Funds requested</h2>
              <p>
                {fields.reqAmount} {roundCurrency}
              </p>
            </>
          )}
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
            {pipe(
              (fieldWhat: string) =>
                sanitizeHtml(fieldWhat, {
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
                  // edge case: handle ampersands in img links encoded from sanitization
                }),
              (fieldWhat: string) => fieldWhat.replaceAll('&amp;', '&'),
              (fieldWhat: string) => injectIpfsGateway(fieldWhat),
            )(fields.what)}
          </Markdown>
        </span>
      </div>
    </>
  );
};

export default ProposalContent;
