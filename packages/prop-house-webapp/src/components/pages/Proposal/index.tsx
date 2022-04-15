import { Link } from 'react-router-dom';
import { useParams } from 'react-router';
import { useAppSelector } from '../../../hooks';
import NotFound from '../NotFound';
import FullProposal from '../../FullProposal';
import { useEffect, useRef, useLayoutEffect } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { useEthers } from '@usedapp/core';
import { useDispatch } from 'react-redux';
import { setActiveProposal } from '../../../state/slices/propHouse';
import classes from './Proposal.module.css';

const Proposal = () => {
  const params = useParams();
  const { id } = params;
  const dispatch = useDispatch();

  const proposal = useAppSelector((state) => state.propHouse.activeProposal);

  const backendHost = useAppSelector(
    (state) => state.configuration.backendHost
  );
  const { library: provider } = useEthers();
  const backendClient = useRef(
    new PropHouseWrapper(backendHost, provider?.getSigner())
  );

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  });

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(
      backendHost,
      provider?.getSigner()
    );
  }, [provider, backendHost]);

  useEffect(() => {
    if (!id) return;
    backendClient.current
      .getProposal(Number(id))
      .then((proposal) => dispatch(setActiveProposal(proposal)));
  }, [id, dispatch]);

  return (
    <>
      {proposal ? (
        <>
          <Link
            to={`/auction/${proposal.auctionId}`}
            className={classes.backToAuction}
          >{`← Funding round ${proposal.auctionId}`}</Link>
          <FullProposal
            proposal={proposal}
            votingWrapper={backendClient.current}
          />
        </>
      ) : (
        <NotFound />
      )}
    </>
  );
};

export default Proposal;
