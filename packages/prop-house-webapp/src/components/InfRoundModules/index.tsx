import {
  Community,
  StoredProposalWithVotes,
  StoredAuctionBase,
} from '@nouns/prop-house-wrapper/dist/builders';
import classes from '../TimedRoundModules/TimedRoundModules.module.css';
import { Col } from 'react-bootstrap';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import clsx from 'clsx';
import getWinningIds from '../../utils/getWinningIds';
import UserPropCard from '../UserPropCard';
import TimedRoundAcceptingPropsModule from '../TimedRoundAcceptingPropsModule';
import TimedRoundVotingModule from '../TimedRoundVotingModule';
import RoundOverModule from '../RoundOverModule';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { isSameAddress } from '../../utils/isSameAddress';
import { isInfAuction, isTimedAuction } from '../../utils/auctionType';
import { useAccount } from 'wagmi';
import InfRoundVotingModule from '../InfRoundVotingModule';
import { useAppSelector } from '../../hooks';
import { InfRoundFilterType } from '../../state/slices/propHouse';
import RoundModuleWinner from '../RoundModuleWinner';
import RoundModuleStale from '../RoundModuleStale';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper.min.css';
import { isMobile } from 'web3modal';
import { infRoundBalance } from '../../utils/infRoundBalance';
import RoundModuleRejected from '../RoundModuleRejected';
import RoundModuleNotStarted from '../RoundModuleNotStarted';
import { Proposal, Round, RoundState } from '@prophouse/sdk-react';
import InfRoundAcceptingPropsModule from '../InfRoundAcceptingPropsModule';

const InfRoundModules: React.FC<{
  round: Round;
  proposals: Proposal[];
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { round, proposals, setShowVotingModal } = props;

  const { address: account } = useAccount();

  // auction statuses
  const roundNotStarted = round.state < RoundState.IN_PROPOSING_PERIOD;
  const isProposingWindow = round.state === RoundState.IN_PROPOSING_PERIOD;
  const isVotingWindow = round.state === RoundState.IN_VOTING_PERIOD;
  const isRoundOver = round.state > RoundState.IN_PROPOSING_PERIOD;

  const getVoteTotal = () =>
    proposals.reduce((total, prop) => (total = total + Number(prop.votingPower)), 0);
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

  const notStartedModule = <RoundModuleNotStarted round={round} />;

  //   const acceptingPropsModule = round.state === RoundState.IN_PROPOSING_PERIOD && (
  //     <InfRoundAcceptingPropsModule round={round} />
  //   );

  //   const timedRoundVotingModule = round.state === RoundState.IN_VOTING_PERIOD && (
  //     <InfRoundVotingModule
  //       round={round}
  //       setShowVotingModal={setShowVotingModal}
  //       totalVotes={getVoteTotal()}
  //     />
  //   );

  // const infRoundVotingModule = isInfAuction(auction) &&
  //   (!account || votingPower > 0) &&
  //   !isRoundOver &&
  //   infRoundFilter === InfRoundFilterType.Active && (
  //     <InfRoundVotingModule setShowVotingModal={setShowVotingModal} />
  //   );

  // const roundWinnerModule = isInfAuction(auction) &&
  //   !isRoundOver &&
  //   infRoundFilter === InfRoundFilterType.Winners && <RoundModuleWinner auction={auction} />;

  // const roundRejectedModule = isInfAuction(auction) &&
  //   !isRoundOver &&
  // infRoundFilter === InfRoundFilterType.Rejected && <RoundModuleRejected auction={auction} />;

  // const roundStaleModule = isInfAuction(auction) && infRoundFilter === InfRoundFilterType.Stale && (
  //   <RoundModuleStale auction={auction} />
  // );

  // const roundOverModule = isRoundOver && (
  //   <RoundOverModule
  //     numOfProposals={proposals.length}
  //     totalVotes={getVoteTotal()}
  //     round={auction}
  //   />
  // );

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
    notStartedModule,
    // acceptingPropsModule,
    // timedRoundVotingModule,
    // infRoundVotingModule,
    // roundWinnerModule,
    // roundRejectedModule,
    // roundStaleModule,
    // roundOverModule,
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
export default InfRoundModules;
