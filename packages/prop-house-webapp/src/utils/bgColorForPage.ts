const bgColorForPage = (path: string) => {
  if (path === '/' || path === '/admin' || path === '/faq') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
