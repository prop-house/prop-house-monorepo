import classes from "./ProposalCard.module.css";
import Card, { CardBgColor, CardBorderRadius } from "../Card";
import { Link } from "react-router-dom";
import { StoredProposal } from "@nouns/prop-house-wrapper/dist/builders";
import diffTime from "../../utils/diffTime";
import detailedTime from "../../utils/detailedTime";
import EthAddress from "../EthAddress";

const ProposalCard: React.FC<{
  proposal: StoredProposal;
}> = (props) => {
  const { proposal } = props;
  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty}>
      <div className={classes.author}>
        <EthAddress>{proposal.address}</EthAddress>
        <span>proposed</span>
      </div>
      <div className={classes.title}>{proposal.title}</div>
      <div className={classes.bottomContainer}>
        <div
          className={classes.timestamp}
          title={detailedTime(proposal.createdDate)}
        >
          {diffTime(proposal.createdDate)}
        </div>
        <div className={classes.readMore}>
          <Link to={`/proposal/${proposal.id}`}>Read more →</Link>
        </div>
      </div>
    </Card>
  );
};

export default ProposalCard;
