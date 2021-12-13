import {
  Auction,
  StoredAuction,
} from "@nouns/prop-house-wrapper/dist/builders";
import { useAppDispatch, useAppSelector } from "../../hooks";
import dayjs from "dayjs";
import { addAuctions } from "../../state/slices/propHouse";

const CreateAuction = () => {
  const backendClient = useAppSelector((state) => state.backend.backend);
  const dispatch = useAppDispatch();

  return (
    <div>
      <button
        onClick={async () => {
          await backendClient.createAuction(
            new Auction(
              true,
              "New Auction",
              new Date(),
              dayjs().add(1, "day").toDate(),
              dayjs().add(2, "day").toDate(),
              10
            )
          );
          await backendClient
            .getAuctions()
            .then((auctions: StoredAuction[]) =>
              dispatch(addAuctions(auctions))
            );
        }}
      >
        Create New Auction
      </button>
    </div>
  );
};

export default CreateAuction;
