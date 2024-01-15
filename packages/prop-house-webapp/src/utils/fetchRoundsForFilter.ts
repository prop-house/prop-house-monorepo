import { OrderDirection, Round_OrderBy } from '@prophouse/sdk-react';
import { RoundsFilter } from '../hooks/useRoundsFilter';
import { PropHouse, RoundWithHouse, Timed } from '@prophouse/sdk-react';

enum RoundEventState {
  Cancelled = 'CANCELLED',
  Created = 'CREATED',
  Finalized = 'FINALIZED',
}

export const fetchRoundsForFilter = async (
  propHouse: PropHouse,
  favorites: string[],
  filter: RoundsFilter,
  pageIndex: number,
  perPage: number,
): Promise<RoundWithHouse[]> => {
  const queryParams = {
    page: pageIndex,
    perPage,
  };

  const now = Math.round(new Date().getTime() / 1000);

  const relevantQuery = propHouse.query.getRoundsWithHouseInfo({
    ...queryParams,
    where: {
      eventState_not: RoundEventState.Cancelled,
      house_not: '0x303979efeac12eca24c8ee1df118e44504ab1d2d', // Solimander Testing 🤫
      balances_: {
        balance_gt: 0,
      },
    },
    orderBy: Round_OrderBy.TimedConfigVotePeriodEndTimestamp,
    orderDirection: OrderDirection.Desc,
  });

  const proposingQuery = propHouse.query.getRoundsWithHouseInfo({
    ...queryParams,
    where: {
      eventState_not: RoundEventState.Cancelled,
      timedConfig_: {
        proposalPeriodEndTimestamp_gte: now,
        proposalPeriodStartTimestamp_lte: now,
      },
      balances_: {
        balance_gt: 0,
      },
    },
    orderBy: Round_OrderBy.TimedConfigProposalPeriodEndTimestamp,
    orderDirection: OrderDirection.Asc,
  });

  const votingQuery = propHouse.query.getRoundsWithHouseInfo({
    ...queryParams,
    where: {
      eventState_not: RoundEventState.Cancelled,
      timedConfig_: {
        votePeriodEndTimestamp_gte: now,
        votePeriodStartTimestamp_lte: now,
      },
      balances_: {
        balance_gt: 0,
      },
    },
    orderBy: Round_OrderBy.TimedConfigProposalPeriodEndTimestamp,
    orderDirection: OrderDirection.Asc,
  });

  const query =
    filter === RoundsFilter.Relevant
      ? relevantQuery
      : filter === RoundsFilter.Favorites // favorites
      ? propHouse.query.getRoundsWithHouseInfo({
          ...queryParams,
          where: {
            house_in: favorites,
          },
        })
      : filter === RoundsFilter.Proposing
      ? proposingQuery
      : filter === RoundsFilter.Voting
      ? votingQuery
      : null; // relevant but account is not connected

  if (!query) return [];

  let rounds;
  const queryRounds = await query;
  rounds = queryRounds.length === 0 ? await relevantQuery : queryRounds;

  if (filter === RoundsFilter.Relevant) {
    const voting = rounds
      .filter(round => round.state === Timed.RoundState.IN_VOTING_PERIOD)
      .sort((a, b) => a.config.votePeriodEndTimestamp - b.config.votePeriodEndTimestamp);
    const proposing = rounds
      .filter(round => round.state === Timed.RoundState.IN_PROPOSING_PERIOD)
      .sort((a, b) => a.config.proposalPeriodEndTimestamp - b.config.proposalPeriodEndTimestamp);
    const inactive = rounds.filter(
      round =>
        round.state !== Timed.RoundState.IN_PROPOSING_PERIOD &&
        round.state !== Timed.RoundState.IN_VOTING_PERIOD,
    );
    rounds = [...voting, ...proposing, ...inactive];
  }

  return rounds.filter(
    r => !(r.isFullyFunded === false && r.state === Timed.RoundState.IN_VOTING_PERIOD),
  );
};
