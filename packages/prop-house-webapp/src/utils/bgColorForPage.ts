const bgColorForPage = (path: string) => {
  if (path === '/' || path === '/faq') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
