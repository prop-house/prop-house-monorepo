import classes from './Proposal.module.css';
import { useParams } from 'react-router';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import NotFound from '../../components/NotFound';
import { useEffect, useRef, useState } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useDispatch } from 'react-redux';
import {
  setActiveCommunity,
  setActiveProposal,
  setActiveRound,
} from '../../state/slices/propHouse';
import { IoArrowBackCircleOutline } from 'react-icons/io5';
import LoadingIndicator from '../../components/LoadingIndicator';
import { StoredProposalWithVotes } from '@nouns/prop-house-wrapper/dist/builders';
import { Container } from 'react-bootstrap';
import { buildRoundPath } from '../../utils/buildRoundPath';
import { cardServiceUrl, CardType } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import RenderedProposalFields from '../../components/RenderedProposalFields';
import { useAccount, useSigner } from 'wagmi';
import ProposalModalVotingModule from '../../components/ProposalModalVotingModule';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import Button, { ButtonColor } from '../../components/Button';
import ConnectButton from '../../components/ConnectButton';
import { useTranslation } from 'react-i18next';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import useVotingPower from '../../hooks/useVotingPower';
import { setVotingPower } from '../../state/slices/voting';

const Proposal = () => {
  const params = useParams();
  const { id } = params;

  const { data: signer } = useSigner();
  const navigate = useNavigate();
  const { address: account, isConnected } = useAccount();
  const { t } = useTranslation();

  const [failedFetch, setFailedFetch] = useState(false);

  const dispatch = useDispatch();
  const proposal = useAppSelector(state => state.propHouse.activeProposal);
  const community = useAppSelector(state => state.propHouse.activeCommunity);
  const round = useAppSelector(state => state.propHouse.activeRound);
  const backendHost = useAppSelector(state => state.configuration.backendHost);
  const backendClient = useRef(new PropHouseWrapper(backendHost, signer));

  const { openConnectModal } = useConnectModal();

  // TODO: DEFINE MODAL TO SHOW VOTING CONFIRMATION
  const [a, setA] = useState(false);

  const [loadingCanVote, votingPower] = useVotingPower(round, account);

  const handleBackClick = () => {
    if (!community || !round) return;
    navigate(buildRoundPath(community, round), { replace: false });
  };

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(backendHost, signer);
  }, [signer, backendHost]);

  // fetch proposal
  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      try {
        const proposal = (await backendClient.current.getProposal(
          Number(id),
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

  const votingBar = proposal && round && auctionStatus(round) === AuctionStatus.AuctionVoting && (
    <>
      <>
        <div className={classes.votingBar}>
          {isConnected ? (
            votingPower && votingPower > 0 ? (
              <ProposalModalVotingModule
                proposal={proposal!}
                setShowVoteAllotmentModal={setA}
                setShowVotingModal={setA}
              />
            ) : (
              <div className={classes.votingBarContent}>
                <b>Wallet is ineligible to vote.</b>
                <div>
                  Trying with the wrong wallet? You can connect another wallet{' '}
                  <span className={classes.inlineClick} onClick={openConnectModal}>
                    here →
                  </span>
                </div>
              </div>
            )
          ) : (
            <div className={classes.votingBarContent}>
              <div>
                <b>Voting has started.</b> Connect a wallet to determine your voting eligibility.
              </div>
              <ConnectButton text={t('connectToVote')} color={ButtonColor.Purple} />{' '}
            </div>
          )}
        </div>
      </>
    </>
  );

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
        {proposal ? (
          <Container>
            <RenderedProposalFields
              proposal={proposal}
              community={community}
              round={round && round}
              backButton={
                <div className={classes.backToAuction} onClick={() => handleBackClick()}>
                  <IoArrowBackCircleOutline size={'1.5rem'} /> View round
                </div>
              }
            />
          </Container>
        ) : failedFetch ? (
          <NotFound />
        ) : (
          <LoadingIndicator />
        )}
        {votingBar}
      </Container>
      <div className={classes.gradient} />
    </>
  );
};

export default Proposal;
