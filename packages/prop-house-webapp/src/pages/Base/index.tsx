import classes from './Base.module.css';
import './Base.css';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { StoredAuction, StoredVoteWithProposal } from '@nouns/prop-house-wrapper/dist/builders';
import { getRelevantComms } from 'prop-house-communities';
import { useEffect, useRef, useState } from 'react';
import { Col, Container, Navbar, Row } from 'react-bootstrap';
import { useAccount, useBlockNumber, useProvider } from 'wagmi';
import FeedVoteCard from '../../components/FeedVoteCard';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAppSelector } from '../../hooks';
import Button, { ButtonColor } from '../../components/Button';
import SimpleRoundCard from '../../components/SimpleRoundCard';
import { FiActivity } from 'react-icons/fi';
import { BiBadgeCheck } from 'react-icons/bi';
import { isMobile } from 'web3modal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Mousewheel, Pagination } from 'swiper';
// Styles must use direct files imports
import 'swiper/swiper.min.css';
import 'swiper/modules/mousewheel/mousewheel.min.css';
import 'swiper/modules/pagination/pagination.min.css';

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

  const viewportWidth = window.innerWidth;
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState<number>();

  useEffect(() => {
    if (!containerRef.current) return;
    setOffset((viewportWidth - containerRef.current.offsetWidth) / 2);
  }, [viewportWidth, containerRef.current?.offsetWidth]);
  return (
    <>
      <Container ref={containerRef}>
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
      </Container>
      <Container fluid>
        <Row>
          <Col style={{ padding: 0 }}>
            {rounds ? (
              <Swiper
                spaceBetween={10}
                slidesPerView={isMobile() ? 1 : 3}
                slidesOffsetBefore={isMobile() ? 15 : offset}
                slidesOffsetAfter={15}
                freeMode={{ enabled: isMobile() ? true : false }}
                modules={[Mousewheel, Pagination]}
                mousewheel={isMobile() ? false : true}
                pagination={{
                  enabled: isMobile() ? true : false,
                  dynamicBullets: true,
                }}
              >
                {rounds.map(r => (
                  <SwiperSlide>
                    <SimpleRoundCard round={r} displayTldr={false} />
                  </SwiperSlide>
                ))}
              </Swiper>
            ) : (
              <LoadingIndicator />
            )}
          </Col>
        </Row>
      </Container>
      <Container>
        <Row>
          <Col>
            <div className={classes.sectionTitle}>
              <FiActivity className={classes.icon} size={22} />
              <>Activity</>
            </div>
            {votes && votes.length > 0 ? (
              <Row>
                {votes.map(v => (
                  <Col xs={12}>
                    <FeedVoteCard vote={v} />
                  </Col>
                ))}
                <Col xs={12}>
                  <Button
                    text="load more votes"
                    bgColor={ButtonColor.Green}
                    onClick={() => fetchMoreVotes()}
                    classNames={classes.loadMoreBtn}
                  />
                </Col>
              </Row>
            ) : (
              <LoadingIndicator />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Base;
