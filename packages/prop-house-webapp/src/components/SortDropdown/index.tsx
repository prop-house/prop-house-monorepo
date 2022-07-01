import classes from "./SortDropdown.module.css";
import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import { auctionStatus, AuctionStatus } from "../../utils/auctionStatus";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { sortProposals } from "../../state/slices/propHouse";
import { dispatchSortProposals, SortType } from "../../utils/sortingProposals";
import { IoArrowDown, IoArrowUp } from "react-icons/io5";
import clsx from "clsx";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .init({
    backend: { loadPath: "/locales/{{lng}}.json" },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

const SortDropdown: React.FC<{ auction: StoredAuction }> = (props) => {
  const { t } = useTranslation();
  const { auction } = props;

  const [dateAscending, setDateAscending] = useState(false);
  const [votesAscending, setVotesAscending] = useState(false);
  const [datesSorted, setDatesSorted] = useState(true);
  const [votesSorted, setVotesSorted] = useState(false);

  const dispatch = useDispatch();

  const isVotingWindow =
    auctionStatus(auction) === AuctionStatus.AuctionVoting ||
    auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const sortDates = () => {
    setDatesSorted(true);
    setVotesSorted(false);

    setDateAscending((prev) => {
      dispatchSortProposals(dispatch, auction, !prev);
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
