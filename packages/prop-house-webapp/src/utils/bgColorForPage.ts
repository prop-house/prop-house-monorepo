const bgColorForPage = (path: string) => {
  if (path === '/') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
