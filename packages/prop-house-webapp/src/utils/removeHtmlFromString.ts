export const removeHtmlFromString = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
