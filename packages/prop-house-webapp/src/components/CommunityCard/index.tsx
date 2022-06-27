import classes from "./CommunityCard.module.css";
import { Community } from "@nouns/prop-house-wrapper/dist/builders";
import CommunityProfImg from "../CommunityProfImg";
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

const CommunityCard: React.FC<{
  community: Community;
}> = (props) => {
  const { community } = props;
  const { t } = useTranslation();

  return (
    <div className={classes.container}>
      <CommunityProfImg community={community} />
      <div className={classes.infoContainer}>
        <div className={classes.title}>{community.name}</div>
        <div className={classes.proposals}>
          <span>{community.numProposals}</span>{" "}
          {community.numProposals === 1 ? t("prop") : t("props")}
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
