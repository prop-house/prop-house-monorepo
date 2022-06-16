import classes from "./SortDropdown.module.css";
import { Dropdown } from "react-bootstrap";
import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import { auctionStatus, AuctionStatus } from "../../utils/auctionStatus";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { sortProposals } from "../../state/slices/propHouse";
import { dispatchSortProposals, SortType } from "../../utils/sortingProposals";

import {
  IoArrowDownCircleOutline,
  IoArrowUpCircleOutline,
} from "react-icons/io5";

const SortDropdown: React.FC<{ auction: StoredAuction }> = (props) => {
  const { auction } = props;

  const [dateAscending, setDateAscending] = useState(false);
  const [votesAscending, setVotesAscending] = useState(false);

  const dispatch = useDispatch();

  const isVotingWindow =
    auctionStatus(auction) === AuctionStatus.AuctionVoting ||
    auctionStatus(auction) === AuctionStatus.AuctionEnded;

  // sort button tapped
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
      <Dropdown className="d-inline mx-2 sortDropdown">
        <Dropdown.Toggle id="dropdown-autoclose-true">Sort </Dropdown.Toggle>

        <Dropdown.Menu>
          {isVotingWindow && (
            <Dropdown.Item
              onClick={sortVotes}
              className={classes.sortDropdownItem}
            >
              <div>Votes </div>
              {votesAscending ? (
                <IoArrowUpCircleOutline size={"1.5rem"} />
              ) : (
                <IoArrowDownCircleOutline
                  size={"1.5rem"}
                  className={classes.icons}
                />
              )}
            </Dropdown.Item>
          )}

          <Dropdown.Item
            onClick={sortDates}
            className={classes.sortDropdownItem}
          >
            <div>Creation Date</div>
            {dateAscending ? (
              <IoArrowUpCircleOutline size={"1.5rem"} />
            ) : (
              <IoArrowDownCircleOutline
                size={"1.5rem"}
                className={classes.icons}
              />
            )}
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default SortDropdown;
