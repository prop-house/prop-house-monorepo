import classes from './Base.module.css';
import './Base.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredAuction, StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { getRelevantComms } from 'prop-house-communities';
import { useEffect, useState } from 'react';
import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { useAccount, useBlockNumber, useProvider } from 'wagmi';
import { useAppSelector } from '../../hooks';
import SimpleRoundCard from '../../components/SimpleRoundCard';
import { BiBadgeCheck } from 'react-icons/bi';

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

  return (
    <>
      <Container>
        <Navbar />
      </Container>
      <Container>
        <Row>
          <Col>
            <div className={classes.sectionTitle}>
              <BiBadgeCheck className={classes.icon} size={22} />
              <>Active rounds</>
            </div>
          </Col>
        </Row>
        <Row>
          {rounds &&
            rounds.map(r => (
              <Col md={6}>
                <SimpleRoundCard round={r} />
              </Col>
            ))}
        </Row>
      </Container>
    </>
  );
};

export default Base;
