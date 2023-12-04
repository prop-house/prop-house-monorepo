import { RoundEventState } from '@prophouse/sdk-react/node_modules/@prophouse/sdk/dist/gql/evm/graphql';
import { RoundsFilter } from '../hooks/useRoundsFilter';
import { PropHouse, RoundWithHouse } from '@prophouse/sdk-react';

export const fetchRoundsForFilter = async (
  propHouse: PropHouse,
  account: string | undefined,
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

  const defaultQuery = propHouse.query.getRoundsWithHouseInfo({
    ...queryParams,
    where: {
      eventState_not: RoundEventState.Cancelled,
      timedConfig_: {
        proposalPeriodStartTimestamp_lte: now,
        votePeriodEndTimestamp_gte: now,
      },
      balances_: {
        balance_gt: 0,
      },
    },
  });

  const query =
    filter === RoundsFilter.Active // active
      ? defaultQuery
      : filter === RoundsFilter.Favorites // favorites
      ? propHouse.query.getRoundsWithHouseInfo({
          ...queryParams,
          where: {
            house_in: favorites,
          },
        })
      : filter === RoundsFilter.Relevant && account // relevant + account is connected
      ? propHouse.query.getRoundsWithHouseInfoRelevantToAccount(account, queryParams)
      : null; // relevant but account is not connected

  if (!query) return [];

  const rounds = await query;
  if (rounds.length === 0) {
    return await defaultQuery;
  }

  return await query;
};