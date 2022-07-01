import { Accordion } from "react-bootstrap";
import classes from "./FAQ.module.css";
import { useTranslation, Trans } from "react-i18next";

interface ContentItem {
  title: string;
  content: React.ReactNode;
}

const content: ContentItem[] = [
  {
    title: "faq1title",
    content: (
      <>
        <Trans i18nKey="faq1answer"></Trans>
      </>
    ),
  },
  {
    title: "faq2title",
    content: (
      <>
        <Trans i18nKey="faq2answer"></Trans>
      </>
    ),
  },
  {
    title: "faq3title",
    content: (
      <>
        <Trans i18nKey="faq3answer"></Trans>
        <a href="https://nouns.wtf/vote" target="_blank" rel="noreferrer">
          {" "}
          <Trans i18nKey="here"></Trans>
        </a>
        .
      </>
    ),
  },
  {
    title: "faq4title",
    content: (
      <>
        <Trans i18nKey="faq4answer"></Trans>
      </>
    ),
  },
  {
    title: "faq5title",
    content: (
      <>
        <Trans i18nKey="faq5answer"></Trans>
      </>
    ),
  },
  {
    title: "faq6title",
    content: (
      <>
        <Trans i18nKey="faq6answer"></Trans>
        <a
          href="https://twitter.com/nounsprophouse"
          target="_blank"
          rel="noreferrer"
        >
          {" "}
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
          <div key={item.title}>
            <Accordion.Item eventKey={`${i}`} className={classes.accordionItem}>
              <Accordion.Header>{t(content[i].title)}</Accordion.Header>
              <Accordion.Body>{content[i].content}</Accordion.Body>
            </Accordion.Item>
          </div>
        ))}
      </Accordion>
    </>
  );
};

export default FAQ;
