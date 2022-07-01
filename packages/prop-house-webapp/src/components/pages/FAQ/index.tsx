import { Accordion } from "react-bootstrap";
import classes from "./FAQ.module.css";
import { useTranslation } from "react-i18next";
import ReactHtmlParser from "react-html-parser";

interface ContentItem {
  title: string;
  content: React.ReactNode;
}

const content: ContentItem[] = [
  { title: "faq1title", content: "faq1answer" },
  { title: "faq2title", content: "faq2answer" },
  { title: "faq3title", content: "faq3answer" },
  { title: "faq4title", content: "faq4answer" },
  { title: "faq5title", content: "faq5answer" },
  { title: "faq6title", content: "faq6answer" },
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
              <Accordion.Body>
                {ReactHtmlParser(t(`${content[i].content}`))}
              </Accordion.Body>
            </Accordion.Item>
          </div>
        ))}
      </Accordion>
    </>
  );
};

export default FAQ;
