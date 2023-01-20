import { Auction } from '@nouns/prop-house-wrapper/dist/builders';

const getTotalEthFunded = (rounds: Auction[]) =>
  rounds
    // filter out rounds that don't distribute
    .filter(round => (round.currencyType || '').toUpperCase() === 'ETH')
    // sum up the total amount of ETH distributed across all rounds
    .reduce((acc, round) => acc + Number(round.fundingAmount) * round.numWinners, 0);

export default getTotalEthFunded;
