const bgColorForPage = (path: string) => {
  if (path === '/' || path === '/faq' || path === '/create' || path === '/rounds') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
