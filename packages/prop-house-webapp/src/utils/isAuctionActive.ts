import { StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import dayjs from "dayjs";

const isAuctionActive = (auction: StoredAuction) => dayjs(auction.proposalEndTime).isAfter(dayjs())

export default isAuctionActive;
