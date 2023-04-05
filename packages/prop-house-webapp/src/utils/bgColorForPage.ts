const bgColorForPage = (path: string) => {
  if (
    path === '/' ||
    path === '/faq' ||
    path === '/create' ||
    path === '/rounds' ||
    path === '/create-round'
  )
    return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
