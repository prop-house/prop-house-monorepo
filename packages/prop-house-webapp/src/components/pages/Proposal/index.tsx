import classes from './Proposal.module.css';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../../hooks';
import NotFound from '../../NotFound';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import {
  setActiveCommunity,
  setActiveProposal,
  setActiveProposals,
  setActiveRound,
} from '../../../state/slices/propHouse';
import ProposalContent from '../../ProposalContent';
import proposalFields from '../../../utils/proposalFields';
import { IoClose } from 'react-icons/io5';
import LoadingIndicator from '../../LoadingIndicator';
import { Direction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { Col, Container, Row } from 'react-bootstrap';
import { buildRoundPath } from '../../../utils/buildRoundPath';
import { cardServiceUrl, CardType } from '../../../utils/cardServiceUrl';
import OpenGraphElements from '../../OpenGraphElements';
import ProposalHeader from '../../ProposalHeader';
import Divider from '../../Divider';
// import { AuctionStatus, auctionStatus } from '../../../utils/auctionStatus';
// import { dispatchSortProposals, SortType } from '../../../utils/sortingProposals';

const Proposal = () => {
  const params = useParams();
  const { id } = params;
  const { library: provider } = useEthers();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [failedFetch, setFailedFetch] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<StoredProposalWithVotes | any>();

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const [currentPropIndex, setCurrentPropIndex] = useState<number | any>();

  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  const handleClosePropModal = () => {
    if (!community || !round) return;
    navigate(buildRoundPath(community, round), { replace: false });
  };

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getProposal(
          Number(id),
        )) as StoredProposalWithVotes;
        document.title = `${proposal.title}`;
        setCurrentProposal(proposal);
        dispatch(setActiveProposal(proposal));
      } catch (e) {
        setFailedFetch(true);
      }
    };

    fetch();

    return () => {
      document.title = 'Prop House';
    };
  }, [id, dispatch, failedFetch]);

  /**
   * when page is entry point, community and round are not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (!proposal) return;
    const fetchCommunity = async () => {
      const round = await backendClient.current.getAuction(proposal.auctionId);
      const community = await backendClient.current.getCommunityWithId(round.community);
      dispatch(setActiveCommunity(community));
      dispatch(setActiveRound(round));
    };

    fetchCommunity();
  }, [id, dispatch, proposal]);

  // fetch proposals
  useEffect(() => {
    if (!round) return;

    const fetchAuctionProposals = async () => {
      const proposals = await backendClient.current.getAuctionProposals(round.id);
      dispatch(setActiveProposals(proposals));

      // dispatchSortProposals(
      //   dispatch,
      //   auctionStatus(round) === AuctionStatus.AuctionEnded
      //     ? SortType.VoteCount
      //     : SortType.CreatedAt,
      //   false,
      // );

      currentProposal &&
        setCurrentPropIndex(
          proposals.findIndex((p: StoredProposalWithVotes) => p.id === currentProposal.id) + 1,
        );
    };

    fetchAuctionProposals();
    return () => {
      dispatch(setActiveProposals([]));
    };
  }, [currentProposal, dispatch, round]);

  const handleDirectionalArrowClick = (direction: Direction) => {
    if (!community || !round) return;

    currentPropIndex &&
      proposals &&
      proposal &&
      navigate(`${pathname.slice(0, -2)}${proposals[currentPropIndex].id}`);
  };

  return (
    <>
      <Container>
        {proposal && (
          <OpenGraphElements
            title={proposal.title}
            description={proposal.tldr}
            imageUrl={cardServiceUrl(CardType.proposal, proposal.id).href}
          />
        )}

        {currentProposal ? (
          <>
            <Row>
              <Col xl={12}>
                {proposals && (
                  <ProposalHeader
                    backButton={
                      <div className={classes.backToAuction} onClick={() => handleClosePropModal()}>
                        <IoClose size={'1.5rem'} />
                      </div>
                    }
                    fieldTitle={proposalFields(currentProposal).title}
                    address={currentProposal.address}
                    proposalId={currentProposal.id}
                    propIndex={currentPropIndex}
                    numberOfProps={proposals.length}
                    handleDirectionalArrowClick={handleDirectionalArrowClick}
                  />
                )}

                <Divider />

                <ProposalContent fields={proposalFields(currentProposal)} />
              </Col>
            </Row>
          </>
        ) : failedFetch ? (
          <NotFound />
        ) : (
          <LoadingIndicator />
        )}
      </Container>
    </>
  );
};

export default Proposal;
