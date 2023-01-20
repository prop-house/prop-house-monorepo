import { Auction } from '@nouns/prop-house-wrapper/dist/builders';

/**
 * Returns the total amount distributed across all ETH-only rounds
 * @param rounds - Array of rounds
 * @returns Total amount of ETH distributed across all rounds
 **/
const getTotalEthFunded = (rounds: Auction[]) =>
  rounds
    .filter(round => {
      const ct = round.currencyType;
      // Return false if currencyType is null or undefined
      if (ct === null || ct === undefined) return false;

      // Filter out rounds that don't distribute ETH
      // g = global match (anywhere in string): 'ETH + AMIGO', 'Ξ & VV, ETH'
      // i - case-insensitive: 'ETH', 'eth', 'eTh' etc
      return /\b(ETH|Ξ)\b/gi.test(ct);
    })

    // sum up the total amount of ETH distributed across all rounds
    .reduce((acc, round) => acc + Number(round.fundingAmount) * round.numWinners, 0);

export default getTotalEthFunded;
