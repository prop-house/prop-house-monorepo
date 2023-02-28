import classes from './Base.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredAuction, StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { getRelevantComms } from 'prop-house-communities';
import { useEffect, useState } from 'react';
import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { useAccount, useBlockNumber, useProvider } from 'wagmi';
import FeedVoteCard from '../../components/FeedVoteCard';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAppSelector } from '../../hooks';
import Button, { ButtonColor } from '../../components/Button';
import SimpleRoundCard from '../../components/SimpleRoundCard';

const Base = () => {
  const { address: account } = useAccount();
  const { data: block } = useBlockNumber();
  const provider = useProvider();

  const VOTE_LOAD = 10;

  const [loadingRelComms, setLoadingRelComms] = useState(false);
  const [relevantCommunities, setRelevantCommunites] = useState<string[] | undefined>(undefined);
  const [rounds, setRounds] = useState<StoredAuction[]>();
  const [votes, setVotes] = useState<StoredVoteWithProposal[]>([]);
  const [votesTracker, setVotesTracker] = useState(0);

  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = new PropHouseWrapper(host);

  useEffect(() => {
    if (!account || relevantCommunities !== undefined || block === undefined) return;
    const getRelComms = async () => {
      try {
        setRelevantCommunites(Object.keys(await getRelevantComms(account, provider, block)));
        setLoadingRelComms(true);
      } catch (e) {
        setRelevantCommunites([]);
        setLoadingRelComms(true);
      }
    };
    getRelComms();
  });

  useEffect(() => {
    if (!account || rounds || !loadingRelComms || votesTracker > 0) return;
    const getRounds = async () => {
      try {
        relevantCommunities && relevantCommunities.length > 0
          ? setRounds(await wrapper.getActiveAuctionsForCommunities(relevantCommunities))
          : setRounds(await wrapper.getActiveAuctions());
      } catch (e) {
        console.log(e);
      }
    };
    getRounds();
  });

  useEffect(() => {
    if (!relevantCommunities || (votes && votes.length > 0) || !loadingRelComms || votesTracker > 0)
      return;
    const getVotes = async () => {
      setVotesTracker(VOTE_LOAD);
      setVotes(await wrapper.getVotes(VOTE_LOAD, votesTracker, 'DESC', relevantCommunities));
    };
    getVotes();
  });

  const fetchMoreVotes = async () => {
    const newVotes = await wrapper.getVotes(VOTE_LOAD, votesTracker, 'DESC', relevantCommunities);
    setVotes(prev => {
      return [...prev, ...newVotes];
    });
    setVotesTracker(prev => prev + VOTE_LOAD);
  };

  return (
    <Container>
      <Navbar />
      <div className={classes.sectionTitle}>Active rounds</div>
      <Row>
        {rounds ? (
          rounds.map(round => (
            <Col md={6}>
              <SimpleRoundCard round={round} displayTldr={false} />
            </Col>
          ))
        ) : (
          <LoadingIndicator />
        )}
      </Row>
      <div className={classes.sectionTitle}>Activity</div>
      <Row>
        <Col>
          {votes && votes.length > 0 ? (
            <Row>
              {votes.map(v => (
                <FeedVoteCard vote={v} />
              ))}
              <Button
                text="load more votes"
                bgColor={ButtonColor.Green}
                onClick={() => fetchMoreVotes()}
              />
            </Row>
          ) : (
            <LoadingIndicator />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Base;
