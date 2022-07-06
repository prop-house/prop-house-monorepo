import classes from "./SortDropdown.module.css";
import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import { auctionStatus, AuctionStatus } from "../../utils/auctionStatus";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { sortProposals } from "../../state/slices/propHouse";
import { SortType } from "../../utils/sortingProposals";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

const SortDropdown: React.FC<{ auction: StoredAuction }> = (props) => {
  const { t } = useTranslation();
  const { auction } = props;

  const auctionEnded = auctionStatus(auction) === AuctionStatus.AuctionEnded;
  const isVotingWindow =
    auctionStatus(auction) === AuctionStatus.AuctionVoting || auctionEnded;

  const [datesSorted, setDatesSorted] = useState(auctionEnded ? false : true);
  const [votesSorted, setVotesSorted] = useState(auctionEnded ? true : false);
  const [dateAscending, setDateAscending] = useState(
    auctionEnded ? false : true
  );
  const [votesAscending, setVotesAscending] = useState(
    auctionEnded ? true : false
  );

  const dispatch = useDispatch();

  const sortDates = () => {
    setDatesSorted(true);
    setVotesSorted(false);

    setDateAscending((prev) => {
      dispatch(
        sortProposals({
          sortType: SortType.CreatedAt,
          ascending: dateAscending,
        })
      );

      return !prev;
    });
  };

  const sortVotes = () => {
    setDatesSorted(false);
    setVotesSorted(true);

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
          <div
            onClick={sortVotes}
            className={clsx(classes.sortItem, votesSorted && classes.active)}
          >
            <div>{t("votes")}</div>
            {votesAscending ? (
              <IoArrowDown size={"1.5rem"} />
            ) : (
              <IoArrowUp size={"1.5rem"} />
            )}
          </div>
        )}

        <div
          onClick={sortDates}
          className={clsx(classes.sortItem, datesSorted && classes.active)}
        >
          <div>{t("created")}</div>
          {dateAscending ? (
            <IoArrowUp size={"1.5rem"} />
          ) : (
            <IoArrowDown size={"1.5rem"} />
          )}
        </div>
      </div>
    </>
  );
};

export default SortDropdown;
