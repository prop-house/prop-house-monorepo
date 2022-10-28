import React, { useEffect, useRef, useState } from 'react';
import classes from './ProposalModal.module.css';
import clsx from 'clsx';
import Modal from 'react-modal';
import Proposal from '../pages/Proposal';
import { useParams } from 'react-router';
import { useLocation, useNavigate } from 'react-router-dom';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import { Direction, StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { useAppSelector } from '../../hooks';
import { buildRoundPath } from '../../utils/buildRoundPath';
import {
  setActiveCommunity,
  setActiveProposal,
  setActiveProposals,
  setActiveRound,
} from '../../state/slices/propHouse';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import LoadingIndicator from '../LoadingIndicator';
import NotFound from '../NotFound';

const ProposalModal = () => {
  const [showProposalModal, setShowProposalModal] = useState(true);

  const params = useParams();
  const { id } = params;
  const { library: provider } = useEthers();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  const [failedFetch, setFailedFetch] = useState(false);
  const [currentProposal, setCurrentProposal] = useState<StoredProposalWithVotes | any>();
  const [currentPropIndex, setCurrentPropIndex] = useState<number>();

  const handleClosePropModal = () => {
    if (!community || !round) return;
    setShowProposalModal(false);
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

      dispatchSortProposals(dispatch, SortType.CreatedAt, false);

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

    proposals &&
      proposals.length > 0 &&
      currentProposal &&
      currentProposal.id &&
      direction &&
      navigate(
        `${pathname.slice(0, -2)}${
          proposals[
            proposals.findIndex((p: StoredProposalWithVotes) => p.id === currentProposal.id) +
              direction
          ].id
        }`,
      );
  };

  return (
    <Modal
      isOpen={showProposalModal}
      onRequestClose={() => handleClosePropModal()}
      className={clsx(classes.modal, 'proposalModalContainer')}
    >
      {proposal && proposals && proposals.length > 0 && currentPropIndex && currentProposal ? (
        <Proposal
          proposal={proposal}
          proposals={proposals}
          currentProposal={currentProposal}
          currentPropIndex={currentPropIndex}
          handleDirectionalArrowClick={handleDirectionalArrowClick}
          handleClosePropModal={handleClosePropModal}
        />
      ) : failedFetch ? (
        <NotFound />
      ) : (
        <LoadingIndicator />
      )}
    </Modal>
  );
};

export default ProposalModal;
