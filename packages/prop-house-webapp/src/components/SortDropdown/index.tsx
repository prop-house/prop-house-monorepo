import classes from "./SortDropdown.module.css";
import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import { auctionStatus, AuctionStatus } from "../../utils/auctionStatus";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { sortProposals } from "../../state/slices/propHouse";
import { dispatchSortProposals, SortType } from "../../utils/sortingProposals";
import { IoArrowDownOutline, IoArrowUpOutline } from "react-icons/io5";

const SortDropdown: React.FC<{ auction: StoredAuction }> = (props) => {
  const { auction } = props;

  const [dateAscending, setDateAscending] = useState(false);
  const [votesAscending, setVotesAscending] = useState(true);

  const dispatch = useDispatch();

  const isVotingWindow =
    auctionStatus(auction) === AuctionStatus.AuctionVoting ||
    auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const sortDates = () => {
    setDateAscending((prev) => {
      dispatchSortProposals(dispatch, auction, !prev);
      return !prev;
    });
  };

  const sortVotes = () => {
    setVotesAscending((prev) => {
      dispatch(
        sortProposals({
          sortType: SortType.Score,
          ascending: votesAscending,
        })
      );

      return !prev;
    });
  };

  return (
    <>
      <div className={classes.sortContainer}>
        {isVotingWindow && (
          <div onClick={sortVotes} className={classes.sortItem}>
            <div>Votes </div>
            {votesAscending ? (
              <IoArrowUpOutline size={"1.5rem"} />
            ) : (
              <IoArrowDownOutline size={"1.5rem"} className={classes.icons} />
            )}
          </div>
        )}

        <div onClick={sortDates} className={classes.sortItem}>
          <div>Created Date</div>
          {dateAscending ? (
            <IoArrowUpOutline size={"1.5rem"} />
          ) : (
            <IoArrowDownOutline size={"1.5rem"} className={classes.icons} />
          )}
        </div>
      </div>
    </>
  );
};

export default SortDropdown;
