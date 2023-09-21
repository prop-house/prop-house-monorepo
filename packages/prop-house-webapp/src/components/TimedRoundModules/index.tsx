import classes from './TimedRoundModules.module.css';
import { Col } from 'react-bootstrap';
import clsx from 'clsx';
import TimedRoundAcceptingPropsModule from '../TimedRoundAcceptingPropsModule';
import TimedRoundVotingModule from '../TimedRoundVotingModule';
import RoundOverModule from '../RoundOverModule';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import { isMobile } from 'web3modal';
import RoundModuleNotStarted from '../RoundModuleNotStarted';
import { Proposal, Round, RoundState } from '@prophouse/sdk-react';
import RoundModuleCancelled from '../RoundModuleCancelled';
import RoundModuleUnknownState from '../RoundModuleUnknownState';

const TimedRoundModules: React.FC<{
  round: Round;
  proposals: Proposal[];
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { round, proposals, setShowVotingModal } = props;

  const { address: account } = useAccount();

  const totalVotesAcrossAllProps = proposals.reduce(
    (total, prop) => (total = total + Number(prop.votingPower)),
    0,
  );
  const [fetchedUserProps, setFetchedUserProps] = useState(false);

  useEffect(() => {
    if (!account || !proposals) return;
    setFetchedUserProps(false);

    // set user props
    // if (proposals.some(p => isSameAddress(p.address, account))) {
    //   setUserProposals(
    //     proposals
    //       .filter(p => isSameAddress(p.address, account))
    //       .sort((a: { voteCountFor: any }, b: { voteCountFor: any }) =>
    //         a.voteCountFor < b.voteCountFor ? 1 : -1,
    //       ),
    //   );

    //   setFetchedUserProps(true);
    // }
  }, [account, proposals]);

  const roundStateUnknown = round.state === RoundState.UNKNOWN && <RoundModuleUnknownState />;

  const roundCancelled = round.state === RoundState.CANCELLED && <RoundModuleCancelled />;

  const notStartedModule = round.state === RoundState.NOT_STARTED && (
    <RoundModuleNotStarted round={round} />
  );

  const acceptingPropsModule = round.state === RoundState.IN_PROPOSING_PERIOD && (
    <TimedRoundAcceptingPropsModule round={round} />
  );

  const timedRoundVotingModule = round.state === RoundState.IN_VOTING_PERIOD && (
    <TimedRoundVotingModule
      round={round}
      setShowVotingModal={setShowVotingModal}
      totalVotes={totalVotesAcrossAllProps}
    />
  );

  const roundOverModule = round.state > RoundState.IN_VOTING_PERIOD && (
    <RoundOverModule numOfProposals={proposals.length} totalVotes={totalVotesAcrossAllProps} />
  );

  // const userPropCardModule = (isInfAuction(auction)
  //   ? infRoundFilter === InfRoundFilterType.Active
  //   : true) &&
  //   !auctionNotStarted &&
  //   account &&
  //   userProposals &&
  //   userProposals.length > 0 &&
  //   fetchedUserProps && (
  //     <UserPropCard
  //       userProps={userProposals}
  //       proposals={proposals}
  //       numOfWinners={isInfAuction(auction) ? 0 : auction.numWinners}
  //       status={auctionStatus(auction)}
  //       winningIds={winningIds && winningIds}
  //     />
  //   );

  const modules = [
    roundStateUnknown,
    roundCancelled,
    notStartedModule,
    acceptingPropsModule,
    timedRoundVotingModule,
    roundOverModule,
    // userPropCardModule,
  ];

  return (
    <Col xl={4} className={clsx(classes.sideCards, classes.breakOut)}>
      {isMobile() ? (
        <Swiper slidesPerView={1} className={classes.swiper}>
          {modules.map(
            (module, index) =>
              React.isValidElement(module) && (
                <SwiperSlide style={{ paddingLeft: '24px', paddingRight: '24px' }} key={index}>
                  {module}
                </SwiperSlide>
              ),
          )}
        </Swiper>
      ) : (
        modules.map(m => m)
      )}
    </Col>
  );
};
export default TimedRoundModules;
