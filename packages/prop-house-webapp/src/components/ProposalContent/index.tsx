import classes from './ProposalContent.module.css';
import { ProposalFields } from '../../utils/proposalFields';
import ReactMarkdown from 'react-markdown';
import Markdown from 'markdown-to-jsx';
import sanitizeHtml from 'sanitize-html';
import { useTranslation } from 'react-i18next';

export interface ProposalContentProps {
  fields: ProposalFields;
}

const ProposalContent: React.FC<ProposalContentProps> = props => {
  const { fields } = props;
  const { t } = useTranslation();

  return (
    <>
      <div className={classes.previewCol}>
        <span className={classes.proposalBody}>
          {fields.tldr && (
            <>
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
        </span>
      </div>
    </>
  );
};

export default ProposalContent;
