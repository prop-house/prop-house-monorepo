import classes from "./ProposalCard.module.css";
import globalClasses from "../../css/globals.module.css";
import Card, { CardBgColor, CardBorderRadius } from "../Card";
import { Link } from "react-router-dom";
import { StoredProposalWithVotes } from "@nouns/prop-house-wrapper/dist/builders";
import diffTime from "../../utils/diffTime";
import detailedTime from "../../utils/detailedTime";
import EthAddress from "../EthAddress";
import clsx from "clsx";
import { AuctionStatus } from "../../utils/auctionStatus";
import { ProposalCardStatus } from "../../utils/cardStatus";
import { VoteAllotment } from "../../utils/voteAllotment";
import PropCardVotingContainer from "../PropCardVotingContainer";
import Tooltip from "../Tooltip";
import { useTranslation } from "react-i18next";

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus?: AuctionStatus;
  cardStatus?: ProposalCardStatus;
  votesFor?: number;
  voteAllotments?: VoteAllotment[];
  canAllotVotes?: () => boolean;
  handleVoteAllotment?: (proposalId: number, support: boolean) => void;
}> = (props) => {
  const {
    proposal,
    auctionStatus,
    cardStatus,
    votesFor,
    voteAllotments,
    canAllotVotes,
    handleVoteAllotment,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={clsx(
          cardStatus === ProposalCardStatus.Voting
            ? clsx(globalClasses.yellowBorder, classes.proposalCardVoting)
            : cardStatus === ProposalCardStatus.Winner
            ? globalClasses.pinkBorder
            : "",
          classes.proposalCard
        )}
      >
        <div className={classes.authorContainer}>
          <span style={{ fontWeight: "600" }}>#{proposal.id}&nbsp;•</span>&nbsp;
          <EthAddress address={proposal.address} />
          &nbsp;
          <span style={{ fontWeight: "600" }}>{t("proposed")}</span>
        </div>
        {proposal.tldr.length > 0 ? (
          <Tooltip
            content={
              <div className={clsx(classes.title, classes.tooltipTitle)}>
                {proposal.title}
              </div>
            }
            tooltipTitle={t("tldr")}
            tooltipContent={proposal.tldr}
          />
        ) : (
          <Link
            to={`/proposal/${proposal.id}`}
            className={clsx(classes.title, classes.noTooltip)}
          >
            {proposal.title}
          </Link>
        )}

        <div className={classes.timestampAndlinkContainer}>
          {auctionStatus === AuctionStatus.AuctionVoting ||
          (auctionStatus === AuctionStatus.AuctionEnded &&
            cardStatus !== ProposalCardStatus.Voting) ? (
            <div className={classes.scoreCopy}>
              {t("votes")}: {Math.trunc(proposal.score)}
            </div>
          ) : (
            <div
              className={classes.timestamp}
              title={detailedTime(proposal.createdDate)}
            >
              {diffTime(proposal.createdDate)}
            </div>
          )}

          <div className={clsx(classes.readMore)}>
            <Link to={{ pathname: `/proposal/${proposal.id}` }}>
              <div
                className={
                  cardStatus === ProposalCardStatus.Voting
                    ? globalClasses.fontYellow
                    : globalClasses.fontPink
                }
              >
                {t("expand")} →
              </div>
            </Link>
          </div>
        </div>

        {cardStatus === ProposalCardStatus.Voting &&
          votesFor !== undefined &&
          voteAllotments &&
          canAllotVotes &&
          handleVoteAllotment && (
            <PropCardVotingContainer
              props={{
                proposal,
                cardStatus,
                votesFor,
                voteAllotments,
                canAllotVotes,
                handleVoteAllotment,
              }}
            />
          )}
      </Card>
    </>
  );
};

export default ProposalCard;
