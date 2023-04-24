import classes from './RoundModules.module.css';
import { Col } from 'react-bootstrap';
import clsx from 'clsx';
import getWinningIds from '../../utils/getWinningIds';
import UserPropCard from '../UserPropCard';
import AcceptingPropsModule from '../AcceptingPropsModule';
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
import { House, Proposal, Round, RoundState } from '@prophouse/sdk-react';

const RoundModules: React.FC<{
  round: Round;
  proposals: Proposal[];
  community: House;
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { round, proposals, community, setShowVotingModal } = props;

  const { address: account } = useAccount();
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const infRoundFilter = useAppSelector(state => state.propHouse.infRoundFilterType);
  const winningIds = getWinningIds(proposals, round);
  const [userProposals, setUserProposals] = useState<Proposal[]>();

  // Round statuses
  const auctionNotStarted = round.state === RoundState.NOT_STARTED;
  const isProposingWindow = round.state === RoundState.IN_PROPOSING_PERIOD;
  const isVotingWindow = round.state === RoundState.IN_VOTING_PERIOD;
  const isRoundOver = round.state >= RoundState.IN_CLAIMING_PERIOD;
  // TODO: Not a thing
  // ||  (isInfAuction(round) && infRoundBalance(proposals, auction) === 0);

  const getVoteTotal = () => proposals.reduce((total, prop) => (total = total + Number(prop.votingPower)), 0);
  const [fetchedUserProps, setFetchedUserProps] = useState(false);

  useEffect(() => {
    if (!account || !proposals) return;
    setFetchedUserProps(false);

    // set user props
    if (proposals.some(p => isSameAddress(p.proposer, account))) {
      setUserProposals(
        proposals
          .filter(p => isSameAddress(p.proposer, account))
          .sort((a, b) =>
            BigInt(a.votingPower) < BigInt(b.votingPower) ? 1 : -1,
          ),
      );

      setFetchedUserProps(true);
    }
  }, [account, proposals]);

  const acceptingPropsModule = ((isTimedAuction(round) && isProposingWindow) ||
    (isInfAuction(round) &&
      !isRoundOver &&
      votingPower === 0 &&
      infRoundFilter === InfRoundFilterType.Active)) && (
    <AcceptingPropsModule round={round} community={community} />
  );

  const timedRoundVotingModule = isTimedAuction(round) && isVotingWindow && (
    <TimedRoundVotingModule
      communityName={community.name ?? ''}
      setShowVotingModal={setShowVotingModal}
      totalVotes={getVoteTotal()}
    />
  );

  const infRoundVotingModule = isInfAuction(round) &&
    (!account || votingPower > 0) &&
    !isRoundOver &&
    infRoundFilter === InfRoundFilterType.Active && (
      <InfRoundVotingModule setShowVotingModal={setShowVotingModal} />
    );

  const roundWinnerModule = isInfAuction(round) &&
    !isRoundOver &&
    infRoundFilter === InfRoundFilterType.Winners && <RoundModuleWinner round={round} />;

  const roundStaleModule = isInfAuction(round) && infRoundFilter === InfRoundFilterType.Stale && (
    <RoundModuleStale round={round} />
  );

  const roundOverModule = isRoundOver && (
    <RoundOverModule
      numOfProposals={proposals.length}
      totalVotes={getVoteTotal()}
      round={round}
    />
  );

  const userPropCardModule = (isInfAuction(round)
    ? infRoundFilter === InfRoundFilterType.Active
    : true) &&
    !auctionNotStarted &&
    account &&
    userProposals &&
    userProposals.length > 0 &&
    fetchedUserProps && (
      <UserPropCard
        userProps={userProposals}
        proposals={proposals}
        numOfWinners={isInfAuction(round) ? 0 : round.config.winnerCount}
        state={round.state}
        winningIds={winningIds && winningIds}
      />
    );

  const modules = [
    acceptingPropsModule,
    timedRoundVotingModule,
    infRoundVotingModule,
    roundWinnerModule,
    roundStaleModule,
    roundOverModule,
    userPropCardModule,
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
export default RoundModules;
