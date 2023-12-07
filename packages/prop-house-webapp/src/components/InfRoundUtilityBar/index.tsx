import { RoundUtilBarItemBalance, RoundUtilBarItemTooltip } from '../RoundUtilBarItem';
import TruncateThousands from '../TruncateThousands';
import { countDecimals } from '../../utils/countDecimals';
import {
  StoredInfiniteAuction,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import { timestampToDateUnit } from '../../utils/timestampToDateUnit';
import { infRoundBalance } from '../../utils/infRoundBalance';

const InfRoundUtilityBar: React.FC<{
  infRound: StoredInfiniteAuction;
  proposals: StoredProposalWithVotes[];
}> = ({ infRound, proposals }) => {
  return (
    <>
      <RoundUtilBarItemTooltip
        title="Quorums"
        content={`${infRound.quorumFor} / ${infRound.quorumAgainst} votes`}
        tooltipContent={`Votes required to pass or reject a proposal: ${infRound.quorumFor} FOR / ${infRound.quorumAgainst} AGAINST.`}
      />

      <RoundUtilBarItemTooltip
        title="Voting period"
        content={timestampToDateUnit(infRound.votingPeriod)}
        tooltipContent={'Period of time each prop has to achieve quorum'}
        titleColor="purple"
      />

      <RoundUtilBarItemBalance
        content={
          <>
            {/* <TruncateThousands
              amount={proposals ? infRoundBalance(proposals, infRound) : 0}
              decimals={countDecimals(infRound.fundingAmount) === 3 ? 3 : 2}
            />{' '}
            {infRound.currencyType} */}
          </>
        }
        // progress={
        //   proposals ? (infRoundBalance(proposals, infRound) / infRound.fundingAmount) * 100 : 0
        // }
        progress={50}
      />
    </>
  );
};
export default InfRoundUtilityBar;
