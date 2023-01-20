import { CommunityWithAuctions } from '@nouns/prop-house-wrapper/dist/builders';

const filterNonEthFunds = (communities: CommunityWithAuctions[]) =>
  communities
    // filter out Meebits/APE
    .filter((c: any) => c.contractAddress !== '0x7Bd29408f11D2bFC23c34f18275bBf23bB716Bc7')
    // filter out UMA
    .filter((c: any) => c.contractAddress !== '0x2381b67c6f1cb732fdf8b3b29d3260ec6f7420bc')
    // filter out USDC
    .filter((c: any) => c.contractAddress !== '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
    .reduce((prev, current) => prev + current.ethFunded, 0);

export default filterNonEthFunds;
