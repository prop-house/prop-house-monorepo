import classes from "./ProposalCard.module.css";
import globalClasses from "../../css/globals.module.css";
import Card, { CardBgColor, CardBorderRadius } from "../Card";
import { Link } from "react-router-dom";
import { StoredProposalWithVotes } from "@nouns/prop-house-wrapper/dist/builders";
import detailedTime from "../../utils/detailedTime";
import clsx from "clsx";
import { AuctionStatus } from "../../utils/auctionStatus";
import { ProposalCardStatus } from "../../utils/cardStatus";
import { VoteAllotment } from "../../utils/voteAllotment";
import PropCardVotingContainer from "../PropCardVotingContainer";
import Davatar from "@davatar/react";
import { useEthers } from "@usedapp/core";

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

  const { library: provider } = useEthers();

  return (
    <>
      <Link to={{ pathname: `/proposal/${proposal.id}` }}>
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
          <div className={classes.authorContainer}>{proposal.title}</div>

          {proposal.tldr.length > 0 && (
            <div className={classes.truncatedTldr}>{proposal.tldr}</div>
          )}

          <div className={classes.timestampAndlinkContainer}>
            <div className={classes.avatarAndPropNumber}>
              <Davatar
                size={24}
                address={proposal.address}
                provider={provider}
                generatedAvatarType="blockies"
              />

              {auctionStatus === AuctionStatus.AuctionVoting ||
              (auctionStatus === AuctionStatus.AuctionEnded &&
                cardStatus !== ProposalCardStatus.Voting) ? (
                <div className={classes.scoreCopy}>
                  Votes: {Math.trunc(proposal.score)}
                </div>
              ) : (
                <div
                  className={classes.timestamp}
                  title={detailedTime(proposal.createdDate)}
                >
                  #{proposal.id}
                </div>
              )}
            </div>

            <div className={clsx(classes.readMore)}>
              <div
                className={
                  cardStatus === ProposalCardStatus.Voting
                    ? globalClasses.fontYellow
                    : globalClasses.fontPink
                }
              >
                View →
              </div>
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
      </Link>
    </>
  );
};

export default ProposalCard;
