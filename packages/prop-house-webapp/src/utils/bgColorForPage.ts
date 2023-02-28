const bgColorForPage = (path: string) => {
  if (path === '/' || path === '/faq' || path === '/create' || path === '/play') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
