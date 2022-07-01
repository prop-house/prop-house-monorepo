import { Accordion } from "react-bootstrap";
import classes from "./FAQ.module.css";
import { useTranslation } from "react-i18next";

interface ContentItem {
  title: string;
  content: React.ReactNode;
}
const content: ContentItem[] = [
  {
    title: "faq1title",
    content: (
      <>
        Nouns Proposal Auction House (or Prop House) is an experimental approach
        to deploying capital. Through funding rounds, ETH is auctioned off to
        the best bidder. The bids are proxy community proposals.
      </>
    ),
  },
  {
    title: "faq2title",
    content: (
      <>
        Anyone with an Ethereum address can submit a proposal to any funding
        round.
      </>
    ),
  },
  {
    title: "faq3title",
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
    title: "faq4title",
    content: (
      <>
        Noun owners and holders of Nouns extension communities NFTs will decide
        who wins by voting. The proposals with the highest most votes will get
        funded.
      </>
    ),
  },
  {
    title: "faq5title",
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
    title: "faq6title",
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
              <Accordion.Header>{t(content[i].title)}</Accordion.Header>
              <Accordion.Body>{content[i].content}</Accordion.Body>
            </Accordion.Item>
          </>
        ))}
      </Accordion>
    </>
  );
};

export default FAQ;
