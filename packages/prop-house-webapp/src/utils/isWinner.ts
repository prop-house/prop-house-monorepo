const isWinner = (winningIds: number[], propId: number) => {
  return winningIds.includes(propId);
};

export default isWinner;
