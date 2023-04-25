import classes from './StatusRoundCards.module.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { getRelevantComms } from 'prop-house-communities';
import { useEffect, useState } from 'react';
import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { useAccount, useBlockNumber, useProvider } from 'wagmi';
import { useAppSelector } from '../../hooks';
import SimpleRoundCard from '../StatusRoundCard';
import { BiBadgeCheck } from 'react-icons/bi';
import LoadingIndicator from '../LoadingIndicator';
import InfiniteScroll from 'react-infinite-scroll-component';
import { usePropHouse } from '@prophouse/sdk-react';
import { useRounds } from '../../hooks/useRounds';
import { proposerSort } from '../../utils/sdk/sort';

const StatusRoundCards = () => {
  const propHouse = usePropHouse();
  const [activeRounds, refreshActiveRounds, loadingActiveRounds] = useRounds(propHouse);
  //   const { address: account } = useAccount();
  //   const { data: block } = useBlockNumber();
  //   const provider = useProvider();
  //   const QUERY_LIMIT = 8;
  //   const [fetchingRelComms, setFetchingRelComms] = useState(false);
  //   const [fetchingInitRounds, setFetchingInitRounds] = useState(false);
  //   const [hasMoreRounds, setHasMoreRounds] = useState(true);
  //   const [relevantCommunities, setRelevantCommunites] = useState<string[] | undefined>(undefined);
  //   const [rounds, setRounds] = useState<StoredAuctionBase[]>();
  //   const [roundsSkip, setRoundsSkip] = useState(0);
  //   const host = useAppSelector(state => state.configuration.backendHost);
  // const wrapper = new PropHouseWrapper(host);
  //   useEffect(() => {
  //     if (relevantCommunities !== undefined || !block) return;
  //     const getRelComms = async () => {
  //       setFetchingRelComms(true);
  //       try {
  //         setRelevantCommunites(
  //           account ? Object.keys(await getRelevantComms(account, provider, block)) : [],
  //         );
  //       } catch (e) {
  //         console.log('Error fetching relevant comms: ', e);
  //         setRelevantCommunites([]);
  //       }
  //       setFetchingRelComms(false);
  //     };
  //     getRelComms();
  //   }, [block, relevantCommunities, account, provider]);
  //   useEffect(() => {
  //     if (rounds || fetchingRelComms || relevantCommunities === undefined) return;
  //     const getRounds = async () => {
  //       setFetchingInitRounds(true);
  //       try {
  //         relevantCommunities.length > 0
  //           ? setRounds(
  //               await wrapper.getActiveAuctionsForCommunities(
  //                 roundsSkip,
  //                 QUERY_LIMIT,
  //                 relevantCommunities,
  //               ),
  //             )
  //           : setRounds(await wrapper.getActiveAuctions(roundsSkip, QUERY_LIMIT));
  //         setRoundsSkip(QUERY_LIMIT);
  //       } catch (e) {
  //         console.log(e);
  //       }
  //       setFetchingInitRounds(false);
  //     };
  //     getRounds();
  //   });
  //   const fetchMoreRounds = async () => {
  //     let newRounds: StoredAuctionBase[];
  //     if (relevantCommunities && relevantCommunities.length > 0) {
  //       newRounds = await wrapper.getActiveAuctionsForCommunities(
  //         roundsSkip,
  //         QUERY_LIMIT,
  //         relevantCommunities,
  //       );
  //     } else {
  //       newRounds = await wrapper.getActiveAuctions(roundsSkip, QUERY_LIMIT);
  //     }
  //     if (newRounds.length === 0) {
  //       setHasMoreRounds(false);
  //       return;
  //     }
  //     setRounds(prev => {
  //       return !prev ? [...newRounds] : [...prev, ...newRounds];
  //     });
  //     setRoundsSkip(prev => prev + QUERY_LIMIT);
  //   };
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
        {loadingActiveRounds ? (
          <LoadingIndicator />
        ) : (
          activeRounds && (
            <InfiniteScroll
              dataLength={activeRounds.length}
              next={refreshActiveRounds}
              hasMore={false}
              loader={<LoadingIndicator />}
              endMessage={
                <div className={classes.noMoreMsg}>
                  <>v nounish, ⌐◨-◨</>
                </div>
              }
            >
              <Row>
                {proposerSort(activeRounds).map((r, i) => (
                  <Col md={6} key={i}>
                    <SimpleRoundCard round={r} />
                  </Col>
                ))}
              </Row>
            </InfiniteScroll>
          )
        )}
      </Container>
    </>
  );
};

// TODO: Update this file
// const StatusRoundCards = () => <></>;

export default StatusRoundCards;
