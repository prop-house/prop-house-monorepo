const bgColorForPage = (path: string) => {
  if (path === '/') return 'bgGray bgNoggles';

  return 'bgWhite';
};

export default bgColorForPage;
