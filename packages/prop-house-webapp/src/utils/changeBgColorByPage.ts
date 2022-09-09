const changeBgColorByPage = (path: string, footer?: boolean) => {
  const isHousePath = new RegExp('.*/.+');
  const isRoundPath = new RegExp('.*/.*/.+');
  const isProposalPath = new RegExp('.*/.*/.*/.+');

  if (!footer) {
    switch (path) {
      case '/':
        return 'bgGray';
      case '/create':
        return 'bgWhite';
      case '/faq':
        return 'bgWhite';
      case '/learn':
        return 'bgWhite';
      case isProposalPath.test(path) && path:
        return 'bgWhite';
      case isRoundPath.test(path) && path:
        return 'bgWhite';
      case isHousePath.test(path) && path:
        return 'bgWhite';
      default:
        return 'bgGray';
    }
  } else {
    switch (path) {
      case '/':
        return 'bgGray';
      case '/faq':
        return 'bgWhite';
      case '/learn':
        return 'bgWhite';
      case '/create':
        return 'bgWhite';
      case isProposalPath.test(path) && path:
        return 'bgWhite';
      case isRoundPath.test(path) && path:
        return 'bgGray';
      case isHousePath.test(path) && path:
        return 'bgGray';
      default:
        return 'bgWhite';
    }
  }
};

export default changeBgColorByPage;
