import { SelectQueryBuilder } from 'typeorm';
import { Entity } from 'typeorm';

export const proposalCountSubquery = (
  qb: SelectQueryBuilder<typeof Entity>,
) => {
  return qb
    .select('p.auctionId', 'auctionId')
    .addSelect('COUNT(p.id)', 'numProposals')
    .from('proposal', 'p')
    .groupBy('p.auctionId');
};
