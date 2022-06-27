import CommunityCard from "../CommunityCard";
import CarouselSection from "../CarouselSection";
import { useEffect, useState, useRef } from "react";
import { Community } from "@nouns/prop-house-wrapper/dist/builders";
import { useAppSelector } from "../../hooks";
import { PropHouseWrapper } from "@nouns/prop-house-wrapper";
import { useEthers } from "@usedapp/core";
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

const CommunityCarousel = () => {
  const [communities, setCommunities] = useState<Community[]>([]);

  const { library } = useEthers();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const { t } = useTranslation();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch communities
  useEffect(() => {
    const getCommunities = async () => {
      const communities = await client.current.getCommunities();
      setCommunities(communities);
    };
    getCommunities();
  }, []);

  const cards = communities.map((c, i) => (
    <CommunityCard community={c} key={i} />
  ));

  return (
    <CarouselSection
      contextTitle={t("browse")}
      mainTitle={t("discover")}
      linkDest="/explore"
      cards={cards}
    />
  );
};

export default CommunityCarousel;
