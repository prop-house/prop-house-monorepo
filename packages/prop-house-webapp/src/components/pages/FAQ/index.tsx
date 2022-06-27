import { Accordion } from "react-bootstrap";
import classes from "./FAQ.module.css";
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

interface ContentItem {
  title: string;
  content: React.ReactNode;
}
const content: ContentItem[] = [
  {
    title: "What is Prop House?",
    content: (
      <>
        Nouns Proposal Auction House (or Prop House) is an experimental approach
        to deploying capital. Through funding rounds, ETH is auctioned off to
        the best bidder. The bids are proxy community proposals.
      </>
    ),
  },
  {
    title: "Who can submit a proposal?",
    content: (
      <>
        Anyone with an Ethereum address can submit a proposal to any funding
        round.
      </>
    ),
  },
  {
    title: "What type of proposals are expected?",
    content: (
      <>
        All things that further proliferate Nouns culture are encouraged.
        Submissions can be both for entire projects or trial of potential
        projects. You can see examples of official proposals that have passed{" "}
        <a href="https://nouns.wtf/vote" target="_blank" rel="noreferrer">
          here
        </a>
        .
      </>
    ),
  },
  {
    title: "How are winners decided?",
    content: (
      <>
        Noun owners and holders of Nouns extension communities NFTs will decide
        who wins by voting. The proposals with the highest most votes will get
        funded.
      </>
    ),
  },
  {
    title: "What happens if I win?",
    content: (
      <>
        Congrats! As the winner of a funding round, you'll received the round's
        funding amount and be invited to the Prop House builders discord. You'll
        have the support of the Nouns community to complete your proposal and
        apply for follow-on funding if needed.
      </>
    ),
  },
  {
    title: "More questions?",
    content: (
      <>
        Twitter DMs are open:{" "}
        <a
          href="https://twitter.com/nounsprophouse"
          target="_blank"
          rel="noreferrer"
        >
          twitter.com/nounsprophouse →
        </a>
      </>
    ),
  },
];

const FAQ = () => {
  const { t } = useTranslation();

  return (
    <>
      <h1 className={classes.title}>{t("frequentlyAsked")}</h1>
      <Accordion flush className={classes.accordion}>
        {content.map((item, i) => (
          <>
            <Accordion.Item eventKey={`${i}`} className={classes.accordionItem}>
              <Accordion.Header>{content[i].title}</Accordion.Header>
              <Accordion.Body>{content[i].content}</Accordion.Body>
            </Accordion.Item>
          </>
        ))}
      </Accordion>
    </>
  );
};

export default FAQ;
