/**
 * Not all houses use ETH as their currency. This function returns the currency of the house.
 * @param contractAddress Address of house
 * @returns Currency type of house
 */
const getHouseCurrency = (contractAddress: string) => {
  if (
    contractAddress === '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7' ||
    contractAddress === '0xf8686d3EDEb49D5D6ac0B669688884284B09cF4b'
  ) {
    return 'APE';
  } else if (contractAddress === '0x2381b67c6f1cb732fdf8b3b29d3260ec6f7420bc') {
    return 'UMA';
  } else {
    return 'Ξ';
  }
};

export default getHouseCurrency;
