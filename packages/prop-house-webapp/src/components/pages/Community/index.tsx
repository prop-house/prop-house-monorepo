import { useLocation, useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import ProfileHeader from "../../ProfileHeader";
import { useEffect, useRef, useState } from "react";
import { useEthers } from "@usedapp/core";
import { PropHouseWrapper } from "@nouns/prop-house-wrapper";
import {
  setActiveAuction,
  setActiveCommunity,
  setAuctions,
} from "../../../state/slices/propHouse";
import { getName } from "prop-house-communities";
import FullAuction from "../../FullAuction";
import dayjs from "dayjs";
import CTA from "../../CTA";
import { addressFormLink } from "../../../utils/addressFormLink";
import { slugToName } from "../../../utils/communitySlugs";
import LoadingIndicator from "../../LoadingIndicator";
import NotFound from "../../NotFound";
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

const Community = () => {
  const location = useLocation();
  const slug = location.pathname.substring(1, location.pathname.length);

  const isValidAddress = slug && ethers.utils.isAddress(slug);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { library } = useEthers();
  const [inactiveCommName, setInactiveCommName] = useState<string>();
  const [failedFetch, setFailedFetch] = useState(false);
  const community = useAppSelector((state) => state.propHouse.activeCommunity);
  const activeAuction = useAppSelector(
    (state) => state.propHouse.activeAuction
  );
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const { t } = useTranslation();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch community
  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        // fetch by address or name
        const community = isValidAddress
          ? await client.current.getCommunity(slug)
          : await client.current.getCommunityWithName(slugToName(slug));

        community.auctions.sort((a, b) =>
          dayjs(a.createdDate) < dayjs(b.createdDate) ? 1 : -1
        );
        dispatch(setActiveCommunity(community));
        dispatch(setAuctions(community.auctions));
        dispatch(setActiveAuction(community.auctions[0]));
      } catch (e) {
        setFailedFetch(true);
        console.log(e);
      }
    };
    fetchCommunity();
    return () => {
      dispatch(setActiveCommunity());
    };
  }, [slug, dispatch, isValidAddress]);

  // fetch inactive commmunity
  useEffect(() => {
    if (!library || community || !slug) return;

    const fetchName = async () => {
      try {
        setInactiveCommName(await getName(slug, library));
      } catch (e) {
        console.log(e);
      }
    };

    fetchName();
  }, [library, community, slug, inactiveCommName]);

  const handleAuctionChange = (next: boolean) => {
    if (!activeAuction || !community || community.auctions.length === 0) return;

    const auctions = community.auctions;
    const index = community.auctions.findIndex(
      (a) => a.id === activeAuction.id
    );

    const updatedIndex = next
      ? auctions[index + 1]
        ? index + 1
        : index
      : auctions[index - 1]
      ? index - 1
      : index;

    dispatch(setActiveAuction(auctions[updatedIndex]));
  };

  const isFirstOrLastAuction = (): [boolean, boolean] => {
    if (!activeAuction || !community || community.auctions.length === 0)
      return [false, false];
    const index = community.auctions.findIndex(
      (a) => a.id === activeAuction.id
    );
    return index === 0 && community.auctions.length === 1
      ? [true, true]
      : index === 0
      ? [true, false]
      : index === community.auctions.length - 1
      ? [false, true]
      : [false, false];
  };

  if (!community && !failedFetch) return <LoadingIndicator />;
  if (!isValidAddress && failedFetch) return <NotFound />;

  return (
    <>
      <ProfileHeader
        community={community}
        inactiveComm={{
          name: inactiveCommName ? inactiveCommName : "N/A",
          contractAddress: slug,
        }}
      />
      {community && activeAuction ? (
        <FullAuction
          auction={activeAuction}
          isFirstOrLastAuction={isFirstOrLastAuction}
          handleAuctionChange={handleAuctionChange}
        />
      ) : community && !activeAuction ? (
        <CTA
          title={t("comingSoon")}
          content={
            <>
              <span>{community.name}</span> {t("noActiveRound")}
            </>
          }
          btnTitle={t("viewHouses")}
          btnAction={() => navigate("/explore")}
        />
      ) : (
        <CTA
          title={t("supercharge")}
          content={
            <span>
              <span>{community ? community.name : inactiveCommName}</span>{" "}
              {t("nonActivePH")}
            </span>
          }
          btnAction={() => {
            window.open(addressFormLink, "_blank");
          }}
          btnTitle={t("contactUs")}
        />
      )}
    </>
  );
};

export default Community;
