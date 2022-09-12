const bgColorForFooter = (path: string) => {
  const isHousePath = new RegExp('.*/.+').test(path);
  const isProposalPath = new RegExp('.*/.*/.*/.+').test(path);
  const pages = ['/faq', '/learn', '/create'];

  if (pages.includes(path) || isProposalPath) return 'bgWhite';
  if (isHousePath) return 'bgGray';

  return 'bgWhite';
};

export default bgColorForFooter;
