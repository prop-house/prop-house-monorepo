const bgColorForFooter = (path: string) => {
  const isCreateRoundPath = path.includes('create-round');
  const isHousePath = new RegExp('.*/.+').test(path);
  const isProposalPath = new RegExp('.*/.*/.*/.+').test(path) || path.includes('/proposal/');

  if (isProposalPath) return 'bgWhite';
  if (
    isHousePath ||
    path === '/' ||
    path === '/admin' ||
    path === '/admin/rounds' ||
    isCreateRoundPath
  )
    return 'bgGray';
  return 'bgWhite';
};

export default bgColorForFooter;
