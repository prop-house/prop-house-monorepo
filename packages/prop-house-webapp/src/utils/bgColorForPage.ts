const bgColorForPage = (path: string) => {
  if (path === '/' || path === '/faq' || path === '/create') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
