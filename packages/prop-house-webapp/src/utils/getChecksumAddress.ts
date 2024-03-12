import { utils } from 'ethers';

export const getChecksumAddress = (address: string) => utils.getAddress(address.replace('0x', '').padStart(40, '0')) 
