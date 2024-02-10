import { sanitizeAddress } from './sanitizeAddress';

const trimEthAddress = (address: string, length?: 'short' | 'long') => {
  let sanitizedAddress = sanitizeAddress(address);

  if (!length || length === 'short')
    return [sanitizedAddress.slice(0, 3), sanitizedAddress.slice(sanitizedAddress.length - 3)].join(
      '..',
    );

  if (length === 'long')
    return [sanitizedAddress.slice(0, 5), sanitizedAddress.slice(sanitizedAddress.length - 4)].join(
      '...',
    );
};

export default trimEthAddress;
