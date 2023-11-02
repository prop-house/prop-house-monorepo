const trimEthAddress = (address: string, length?: 'short' | 'long') => {
  if (!length || length === 'short')
    return [address.slice(0, 3), address.slice(address.length - 3)].join('..');

  if (length === 'long')
    return [address.slice(0, 5), address.slice(address.length - 4)].join('...');
};

export default trimEthAddress;
