import { Accordion, Container } from 'react-bootstrap';
import classes from './FAQ.module.css';
import { useTranslation } from 'react-i18next';
import ReactHtmlParser from 'react-html-parser';
import SearchBar from '../../SeachBar';
import { useEffect, useState } from 'react';
import RoundMessage from '../../RoundMessage';

interface ContentItem {
  title: string;
  content: React.ReactNode;
}

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

const FAQ = () => {
  const [input, setInput] = useState('');
  const [filteredFAQs, setfFilteredFAQs] = useState(content);

  const { t } = useTranslation();

  const handleFAQInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  useEffect(() => {
    if (input.length === 0) setfFilteredFAQs(content);

    setfFilteredFAQs(
      content.filter(c => {
        const query = input.toLowerCase();

        return t(c.title.toLowerCase()).indexOf(query) >= 0;
      }),
    );
  }, [input, t]);

  return (
    <>
      <Container>
        <h1 className={classes.title}>{t('frequentlyAsked')}</h1>

        <div className={classes.searchWrapper}>
          <SearchBar
            input={input}
            handleSeachInputChange={handleFAQInputChange}
            placeholder="Search for questions"
          />
        </div>

        {filteredFAQs.length === 0 ? (
          <RoundMessage message="No FAQs found" />
        ) : (
          <Accordion className={classes.accordion}>
            {filteredFAQs.map((item, i) => (
              <div key={item.title}>
                <Accordion.Item eventKey={`${i}`} className={classes.accordionItem}>
                  <Accordion.Header>{t(filteredFAQs[i].title)}</Accordion.Header>
                  <Accordion.Body>
                    {ReactHtmlParser(t(`${filteredFAQs[i].content}`))}
                  </Accordion.Body>
                </Accordion.Item>
              </div>
            ))}
          </Accordion>
        )}
      </Container>
    </>
  );
};

export default FAQ;
