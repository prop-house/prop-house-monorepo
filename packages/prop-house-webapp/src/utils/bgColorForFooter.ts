const bgColorForFooter = (path: string) => {
  const isHousePath = new RegExp('.*/.+').test(path);
  const isProposalPath = new RegExp('.*/.*/.*/.+').test(path);
  const pages = ['/faq', '/create'];

  if (pages.includes(path)) return 'bgWhite';
  if (isHousePath || isProposalPath || '/') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForFooter;
