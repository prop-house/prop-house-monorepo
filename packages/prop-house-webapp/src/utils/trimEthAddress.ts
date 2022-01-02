const trimEthAddress = (address: string) =>
  [address.slice(0, 5), address.slice(address.length - 4)].join("...");

export default trimEthAddress;
