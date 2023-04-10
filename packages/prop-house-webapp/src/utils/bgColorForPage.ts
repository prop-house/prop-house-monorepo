const bgColorForPage = (path: string) => {
  if (
    path === '/' ||
    path === '/faq' ||
    path === '/create' ||
    path === '/rounds' ||
    path === '/create-round' ||
    path === '/admin' ||
    path === '/admin/rounds'
  )
    return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
