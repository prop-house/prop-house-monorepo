const FundingAmount: React.FC<{ amount: number; currencyType?: string }> = props => {
  const { amount, currencyType } = props;
  return <>{`${amount} ${currencyType ? currencyType : 'Ξ'}`}</>;
};

export default FundingAmount;
