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
import { useAccount, useProvider } from 'wagmi';
import { useAppSelector } from '../../hooks';
import { useEffect, useState } from 'react';
import { execStrategy } from '@prophouse/communities';

const AcceptingPropsModule: React.FC<{
  auction: StoredAuctionBase;
  community: Community;
}> = props => {
  const { auction, community } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const provider = useProvider();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const [canPropose, setCanPropose] = useState(auction.propStrategy === null ? true : false);

  const proposingCopy =
    auction.propStrategy === null
      ? t('anyoneCanSubmit')
      : 'Anyone that meets the round proposal requirements can submit a proposal.';

  useEffect(() => {
    const canPropose = async () => {
      const params = {
        strategyName: auction.propStrategy.strategyName,
        account,
        blockTag: auction.balanceBlockTag,
        provider,
        ...auction.propStrategy,
      };

      try {
        setCanPropose((await execStrategy(params)) > 0);
      } catch (e) {
        console.log(e);
      }
    };
    canPropose();
  });

  const content = (
    <>
      <b>{t('howProposingWorks')}:</b>
      <div className={classes.bulletList}>
        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p>{proposingCopy}</p>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
          <p>
            {t('ownersOfThe')} <b>{community.name}</b> {t('tokenWillVote')}.
          </p>
        </div>

        <div className={classes.bulletItem}>
          <hr className={classes.bullet} />
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
              canPropose
                ? 'Create your proposal'
                : 'Your account is not eligible to submit a proposal'
            }
            bgColor={canPropose ? ButtonColor.Green : ButtonColor.Gray}
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
