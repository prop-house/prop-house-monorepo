export const nounsDelegatedVotesToAddressQuery = (address: string) => `
  {
    delegates(where: { id: "${address}" }) {
      delegatedVotesRaw
    }
  }
`;
