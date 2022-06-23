import classes from './Proposal.module.css';
import { useParams } from 'react-router';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../../hooks';
import NotFound from '../../NotFound';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import {
  setActiveCommunity,
  setActiveProposal,
} from '../../../state/slices/propHouse';
import RenderedProposalFields from '../../RenderedProposalFields';
import proposalFields from '../../../utils/proposalFields';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import LoadingIndicator from '../../LoadingIndicator';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';

const Proposal = () => {
  const params = useParams();
  const { id } = params;

  const navigate = useNavigate();
  const location = useLocation();
  const isEntryPoint = !location.state?.fromRoundPage;

  const dispatch = useDispatch();
  const [failedFetch, setFailedFetch] = useState(false);
  const proposal = useAppSelector((state) => state.propHouse.activeProposal);
  const community = useAppSelector((state) => state.propHouse.activeCommunity);
  const backendHost = useAppSelector(
    (state) => state.configuration.backendHost
  );
  const { library: provider } = useEthers();
  const backendClient = useRef(
    new PropHouseWrapper(backendHost, provider?.getSigner())
  );

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(
      backendHost,
      provider?.getSigner()
    );
  }, [provider, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getProposal(
          Number(id)
        )) as StoredProposalWithVotes;
        document.title = `${proposal.title}`;
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
   * when /proposal/:id is entry point, community is not yet
   * avail for back button so it has to be fetched.
   */
  useEffect(() => {
    if (community || !proposal || !proposal.auctionId) return;

    const fetchCommunity = async () => {
      const auction = await backendClient.current.getAuction(
        proposal.auctionId
      );
      const community = await backendClient.current.getCommunityWithId(
        auction.communityId
      );
      dispatch(setActiveCommunity(community));
    };

    fetchCommunity();
  }, [id, dispatch, proposal, community]);

  return (
    <>
      {proposal ? (
        <>
          <RenderedProposalFields
            fields={proposalFields(proposal)}
            address={proposal.address}
            proposalId={proposal.id}
            communityName={community?.name}
            backButton={
              <div
                className={classes.backToAuction}
                onClick={() => {
                  isEntryPoint
                    ? navigate(`/${community?.contractAddress}`)
                    : navigate(-1);
                }}
              >
                <IoArrowBackCircleOutline size={'1.5rem'} />
                <span>Back</span>
              </div>
            }
          />
        </>
      ) : failedFetch ? (
        <NotFound />
      ) : (
        <LoadingIndicator />
      )}
    </>
  );
};

export default Proposal;
