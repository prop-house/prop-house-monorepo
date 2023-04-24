const TruncateThousands: React.FC<{ amount: number | string; decimals?: number }> = props => {
  const { amount, decimals } = props;
  const _amount = Number(amount);

  const addDecimals = (amount: number) =>
    decimals
      ? amount % 1 !== 0
        ? Number(amount).toFixed(decimals)
        : amount
      : Number(amount).toFixed(0);

  return (
    <>
      {addDecimals(_amount >= 1000 ? _amount / 1000 : _amount)}
      {amount >= 1000 && 'K'}
    </>
  );
};

export default TruncateThousands;
