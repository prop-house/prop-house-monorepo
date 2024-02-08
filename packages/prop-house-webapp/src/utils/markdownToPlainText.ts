import ReactDOMServer from 'react-dom/server';
import { ReactElement } from 'react-markdown/lib/react-markdown';

/**
 * Takes `ReactMarkdown` component and returns plain text of content
 */
export const markdownComponentToPlainText = (reactMarkdownComponent: ReactElement) => {
  const html = ReactDOMServer.renderToString(reactMarkdownComponent);
  const stripHtml = html.replace(/<\/?[^>]+(>|$)/g, '');
  const stripBr = stripHtml.replace(/(<|&lt;)br\s*\/*(>|&gt;)/g, ' ');
  return stripBr;
};
