import {
  Community,
  StoredAuction,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import classes from './RoundModules.module.css';
import { Col } from 'react-bootstrap';
import { useAppSelector } from '../../hooks';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import getWinningIds from '../../utils/getWinningIds';
import UserPropCard from '../UserPropCard';
import AcceptingPropsModule from '../AcceptingPropsModule';
import VotingModule from '../VotingModule';
import RoundOverModule from '../RoundOverModule';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { isSameAddress } from '../../utils/isSameAddress';
import { voteWeightForAllottedVotes } from '../../utils/voteWeightForAllottedVotes';
import { useTranslation } from 'react-i18next';
import { clearProposal } from '../../state/slices/editor';
import { useDispatch } from 'react-redux';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';

const RoundModules: React.FC<{
  auction: StoredAuction;
  proposals: StoredProposalWithVotes[];
  community: Community;
  setShowVotingModal: Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { auction, proposals, community, setShowVotingModal } = props;

  const { address: account } = useAccount();
  const { openConnectModal: connect } = useConnectModal();

  const navigate = useNavigate();

  const votingPower = useAppSelector(state => state.voting.votingPower);
  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);

  const winningIds = getWinningIds(proposals, auction);
  const [userProposals, setUserProposals] = useState<StoredProposalWithVotes[]>();
  const { t } = useTranslation();

  // auction statuses
  const auctionNotStarted = auctionStatus(auction) === AuctionStatus.AuctionNotStarted;
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const isVotingWindow = auctionStatus(auction) === AuctionStatus.AuctionVoting;
  const isRoundOver = auctionStatus(auction) === AuctionStatus.AuctionEnded;

  const getVoteTotal = () =>
    proposals.reduce((total, prop) => (total = total + Number(prop.voteCount)), 0);
  const [fetchedUserProps, setFetchedUserProps] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!account || !proposals) return;
    setFetchedUserProps(false);

    // set user props
    if (proposals.some(p => isSameAddress(p.address, account))) {
      setUserProposals(
        proposals
          .filter(p => isSameAddress(p.address, account))
          .sort((a: { voteCount: any }, b: { voteCount: any }) =>
            Number(a.voteCount) < Number(b.voteCount) ? 1 : -1,
          ),
      );

      setFetchedUserProps(true);
    }
  }, [account, proposals]);

  return (
    <Col xl={4} className={clsx(classes.sideCards, classes.carousel, classes.breakOut)}>
      {!auctionNotStarted &&
        account &&
        userProposals &&
        userProposals.length > 0 &&
        fetchedUserProps && (
          <UserPropCard
            userProps={userProposals}
            proposals={proposals}
            numOfWinners={auction.numWinners}
            status={auctionStatus(auction)}
            winningIds={winningIds && winningIds}
          />
        )}

      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.thirty}
        classNames={classes.sidebarContainerCard}
      >
        {/* CONTENT */}
        <div className={classes.content}>
          {/* ACCEPTING PROPS */}
          {isProposingWindow && (
            <AcceptingPropsModule auction={auction} communityName={community.name} />
          )}

          {/* VOTING WINDOW */}
          {isVotingWindow && (
            <VotingModule communityName={community.name} totalVotes={getVoteTotal()} />
          )}

          {/* ROUND ENDED */}
          {isRoundOver && (
            <RoundOverModule numOfProposals={proposals.length} totalVotes={getVoteTotal()} />
          )}
        </div>

        {/* BUTTONS */}
        <div className={classes.btnContainer}>
          {/* ACCEPTING PROPS */}
          {isProposingWindow &&
            (account ? (
              <Button
                text={t('createYourProposal')}
                bgColor={ButtonColor.Green}
                onClick={() => {
                  dispatch(clearProposal());
                  navigate('/create', { state: { auction, community } });
                }}
              />
            ) : (
              <Button text={t('connectToSubmit')} bgColor={ButtonColor.Pink} onClick={connect} />
            ))}

          {/* VOTING WINDOW, NOT CONNECTED */}
          {isVotingWindow && !account && (
            <Button text={t('connectToVote')} bgColor={ButtonColor.Pink} onClick={connect} />
          )}

          {/* VOTING PERIOD, CONNECTED, HAS VOTES */}
          {isVotingWindow && account && votingPower ? (
            <Button
              text={t('submitVotes')}
              bgColor={ButtonColor.Purple}
              onClick={() => setShowVotingModal(true)}
              disabled={
                voteWeightForAllottedVotes(voteAllotments) === 0 || submittedVotes === votingPower
              }
            />
          ) : (
            //  VOTING PERIOD, CONNECTED, HAS NO VOTES
            <></>
          )}
        </div>
      </Card>
    </Col>
  );
};
export default RoundModules;
