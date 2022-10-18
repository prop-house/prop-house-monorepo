import ReactDOMServer from 'react-dom/server';
import { ReactElement } from 'react-markdown/lib/react-markdown';

/**
 * Takes `ReactMarkdown` component and returns plain text of content
 */
export const markdownComponentToPlainText = (reactMarkdownComponent: ReactElement) => {
  const html = ReactDOMServer.renderToString(reactMarkdownComponent);
  const stripHtml = html.replace(/<\/?[^>]+(>|$)/g, '');
  return stripHtml;
};
