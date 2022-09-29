const TruncateThousands: React.FC<{ amount: number; decimals?: number }> = props => {
  const { amount, decimals } = props;
  return <>{amount > 1000 ? `${(amount / 1000).toFixed(decimals ? decimals : 1)}K` : amount}</>;
};

export default TruncateThousands;
