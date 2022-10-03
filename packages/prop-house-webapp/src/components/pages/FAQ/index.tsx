import { Accordion, Container } from 'react-bootstrap';
import classes from './FAQ.module.css';
import { useTranslation } from 'react-i18next';
import ReactHtmlParser from 'react-html-parser';

interface ContentItem {
  title: string;
  content: React.ReactNode;
}

const FAQ = () => {
  const { t } = useTranslation();

  const content: ContentItem[] = [
    { title: 'faq1title', content: 'faq1answer' },
    { title: 'faq2title', content: 'faq2answer' },
    { title: 'faq3title', content: 'faq3answer' },
    { title: 'faq4title', content: 'faq4answer' },
    { title: 'faq5title', content: 'faq5answer' },
    { title: 'faq6title', content: 'faq6answer' },
    { title: 'faq7title', content: 'faq7answer' },
    { title: 'faq8title', content: 'faq8answer' },
    { title: 'faq9title', content: 'faq9answer' },
    { title: 'faq10title', content: 'faq10answer' },
    { title: 'faq11title', content: 'faq11answer' },
    { title: 'faq12title', content: 'faq12answer' },
    { title: 'faq13title', content: 'faq13answer' },
    { title: 'faq14title', content: 'faq14answer' },
    { title: 'faq15title', content: 'faq15answer' },
    { title: 'faq16title', content: 'faq16answer' },
    { title: 'faq17title', content: 'faq17answer' },
    { title: 'faq18title', content: 'faq18answer' },
    { title: 'faq19title', content: 'faq19answer' },
  ];

  return (
    <>
      <Container>
        <h1 className={classes.title}>{t('frequentlyAsked')}</h1>
        <Accordion flush className={classes.accordion}>
          {content.map((item, i) => (
            <div key={item.title}>
              <Accordion.Item eventKey={`${i}`} className={classes.accordionItem}>
                <Accordion.Header>{t(content[i].title)}</Accordion.Header>
                <Accordion.Body>{ReactHtmlParser(t(`${content[i].content}`))}</Accordion.Body>
              </Accordion.Item>
            </div>
          ))}
        </Accordion>
      </Container>
    </>
  );
};

export default FAQ;
