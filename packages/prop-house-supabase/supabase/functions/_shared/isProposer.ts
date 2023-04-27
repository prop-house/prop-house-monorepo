export const isProposer = async (address: string, proposalId: number) => {
  const query = `
        query {
          proposal(id: ${proposalId}) {
          address
        }
      }`;

  const requestOptions: RequestInit = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
    }),
  };

  try {
    const response = await fetch('https://prod.backend.prop.house/graphql', requestOptions);
    const data = await response.json();
    return String(data.data.proposal.address).toLowerCase() === address.toLowerCase();
  } catch (error) {
    throw new Error(`Error fetching proposer status: ${error.message}`);
  }
};
