import { Accordion } from 'react-bootstrap';
import classes from './FAQ.module.css';

interface ContentItem {
  title: string;
  content: React.ReactNode;
}
const content: ContentItem[] = [
  {
    title: 'What is Prop House?',
    content: (
      <>
        Nouns Proposal Auction House (or Prop House) is an experimental approach
        to deploying capital. Through funding rounds, ETH is auctioned off to
        the best bidder. The bids are proxy Nouns DAO proposals.
      </>
    ),
  },
  {
    title: 'Who can submit a proposal?',
    content: (
      <>
        Anyone with an Ethereum address can submit a proposal to any funding
        round.
      </>
    ),
  },
  {
    title: 'What type of proposals are expected?',
    content: (
      <>
        All things that further proliferate Nouns culture are encouraged.
        Submissions can be both for entire projects or trial of potential
        projects. You can see examples of official proposals that have passed{' '}
        <a href="https://nouns.wtf/vote" target="_blank" rel="noreferrer">
          here
        </a>
        .
      </>
    ),
  },
  {
    title: 'How are winners decided?',
    content: (
      <>
        Noun owners and holders of Nouns extension communities NFTs will decide
        who wins by voting. The three proposals with the highest <b>scores</b>{' '}
        will get funded.
      </>
    ),
  },
  {
    title: 'How are proposal scores calculated?',
    content: (
      <>
        Weighted voting is used to calculate scores. 50% of voting power is held
        by Noun owners while the other 50% is held by Nouns extension
        communities. Each vote for each category has a score depending on three
        factors:
        <br></br>
        <br></br>
        <ul>
          <li>Total votes for both categories</li>
          <li>Voting power for specific category</li>
          <li>Total votes for specific categories</li>
        </ul>
        To get the score for individual votes, we follow the followiing formula:
        <br></br>
        <br></br>
        <b>
          Total votes for both categories * Voting power for specific category /
          Total votes for specific category
        </b>
        <br></br>
        <br></br>
        Once you've gotten the individual vote score, we add up all votes for
        each proposal by assigning the individual vote score using their
        corresponding weight.
      </>
    ),
  },
  {
    title: 'What happens if I win?',
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
    title: 'Which extension communities can vote?',
    content: (
      <>
        <ul>
          <li>ext_comm</li> <li>ext_comm</li> <li>ext_comm</li>
          <li>ext_comm</li>
        </ul>
        If your nounish community would like to participate in Prop House
        voting, please reach out via{' '}
        <a
          href="https://twitter.com/nounsprophouse"
          target="_blank"
          rel="noreferrer"
        >
          twitter
        </a>
        .
      </>
    ),
  },
  {
    title: 'More questions?',
    content: (
      <>
        Twitter DMs are open:{' '}
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
  return (
    <>
      <h1 className={classes.title}>Frquently Asked Questions:</h1>
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
