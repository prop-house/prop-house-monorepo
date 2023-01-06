const bgColorForFooter = (path: string) => {
  const isHousePath = new RegExp('.*/.+').test(path);
  const isProposalPath = new RegExp('.*/.*/.*/.+').test(path);

  if (isProposalPath) return 'bgWhite';
  if (isHousePath || '/') return 'bgGray';

  return 'bgWhite';
};

export default bgColorForFooter;
