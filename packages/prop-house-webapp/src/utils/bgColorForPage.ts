const bgColorForPage = (path: string) => {
  const isProposalPath = new RegExp('.*/.*/.*/.+').test(path);
  if (path === '/' || isProposalPath) return 'bgGray';

  return 'bgWhite';
};

export default bgColorForPage;
