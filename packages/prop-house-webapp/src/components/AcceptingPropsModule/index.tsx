import classes from './AcceptingPropsModule.module.css';
import { Community, StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useDispatch } from 'react-redux';
import { clearProposal } from '../../state/slices/editor';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import { isInfAuction } from '../../utils/auctionType';
import dayjs from 'dayjs';
import ConnectButton from '../ConnectButton';
import { useAccount } from 'wagmi';
import { useAppSelector } from '../../hooks';
import LoadingIndicator from '../LoadingIndicator';
import useProposalGrants from '../../hooks/useProposalGrants';
import { BsPersonFill, BsFillAwardFill } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';

const AcceptingPropsModule: React.FC<{
  auction: StoredAuctionBase;
  community: Community;
}> = props => {
  const { auction, community } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const [loadingCanPropose, canPropose, proposingCopy, votingCopy] = useProposalGrants(
    auction,
    account,
  );

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsPersonFill color="" />
          </div>
          <p>{proposingCopy}</p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <MdHowToVote />
          </div>
          <p>{votingCopy}</p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsFillAwardFill />
          </div>
          <p>
            {isInfAuction(auction) ? (
              'Proposals that meet quorum will get funded.'
            ) : (
              <>
                {' '}
                {t('theTop')} <b>{auction.numWinners}</b>{' '}
                {auction.numWinners === 1 ? 'proposal' : 'proposals'} {t('willGetFunded')}{' '}
                <b>
                  {auction.fundingAmount} {auction.currencyType}{' '}
                </b>
                {t('each')}.
              </>
            )}
          </p>
        </div>
      </div>

      {isProposingWindow &&
        (account ? (
          <Button
            text={
              loadingCanPropose ? (
                <div className={classes.loadingCopy}>
                  Verifying account requirements
                  <LoadingIndicator height={30} width={30} />
                </div>
              ) : canPropose && !loadingCanPropose ? (
                'Create your proposal'
              ) : (
                'Wallet is ineligible to propose'
              )
            }
            bgColor={loadingCanPropose || !canPropose ? ButtonColor.Gray : ButtonColor.Green}
            onClick={() => {
              dispatch(clearProposal());
              navigate('/create', { state: { auction, community, proposals } });
            }}
            disabled={!canPropose}
          />
        ) : (
          <ConnectButton color={ButtonColor.Pink} />
        ))}
    </>
  );

  return (
    <RoundModuleCard
      title={t('acceptingProposals')}
      subtitle={
        <>
          Until{' '}
          {isInfAuction(auction)
            ? 'funding is depleted'
            : dayjs(auction.proposalEndTime).format('MMMM D')}
        </>
      }
      content={content}
      type="proposing"
    />
  );
};

export default AcceptingPropsModule;
