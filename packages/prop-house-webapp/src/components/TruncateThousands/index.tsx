const TruncateThousands: React.FC<{ amount: number; decimals?: number }> = props => {
  const { amount, decimals } = props;

  const addDecimals = (amount: number) =>
    decimals ? Number(amount).toFixed(decimals) : Number(amount).toFixed(0);

  return <>{addDecimals(amount > 1000 ? amount / 1000 : amount)}</>;
};

export default TruncateThousands;
