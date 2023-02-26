import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredAuction, StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { getRelevantComms } from 'prop-house-communities';
import { useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useAccount, useProvider } from 'wagmi';
import FeedVoteCard from '../../components/FeedVoteCard';
import LoadingIndicator from '../../components/LoadingIndicator';
import RoundCard from '../../components/RoundCard';
import { useAppSelector } from '../../hooks';

const Base = () => {
  const { address: account } = useAccount();
  const [rounds, setRounds] = useState<StoredAuction[]>();
  const [votes, setVotes] = useState<StoredVoteWithProposal[]>();
  const provider = useProvider();
  const host = useAppSelector(state => state.configuration.backendHost);
  const wrapper = new PropHouseWrapper(host);

  useEffect(() => {
    if (!account || !provider || rounds) return;

    const getRounds = async () => {
      const relevantComms = await getRelevantComms(account, provider, 16700923);
      const addresses = Object.keys(relevantComms);
      setRounds(await wrapper.getActiveAuctionsForCommunities(addresses));
    };

    getRounds();
  });

  useEffect(() => {
    if (!account || !provider || votes) return;

    const getRounds = async () => {
      const relevantComms = await getRelevantComms(account, provider, 16700923);
      const addresses = Object.keys(relevantComms);
      setVotes(await wrapper.getVotesForCommunities(addresses));
    };

    getRounds();
  });

  return rounds ? (
    <>
      <h3>Active rounds:</h3>
      <Row>
        {rounds.map(round => (
          <Col md={6}>
            <RoundCard round={round} displayTldr={false} />
          </Col>
        ))}
      </Row>
      <h3>Feed:</h3>
      <Row>
        <Col>
          {votes &&
            votes.map(v => (
              <Row>
                <FeedVoteCard vote={v} />
              </Row>
            ))}
        </Col>
      </Row>
    </>
  ) : (
    <LoadingIndicator />
  );
};

export default Base;
