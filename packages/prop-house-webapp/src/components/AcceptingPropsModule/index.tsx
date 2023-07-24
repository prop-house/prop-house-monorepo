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
import LoadingIndicator from '../LoadingIndicator';

const AcceptingPropsModule: React.FC<{
  auction: StoredAuctionBase;
  community: Community;
}> = props => {
  const { auction, community } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const provider = useProvider({
    chainId: auction.propStrategy.chainId,
  });
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const [canPropose, setCanPropose] = useState<null | boolean>(null);
  const [loadingCanPropose, setLoadingCanPropose] = useState(false);

  const proposingCopy =
    auction.propStrategyDescription === null
      ? "Accounts that meet the round's proposing requirements can submit a proposal."
      : auction.propStrategyDescription;

  const votingCopy =
    auction.voteStrategyDescription === null
      ? "Accounts that meet the round's voting requirements can vote for their favorite props."
      : auction.voteStrategyDescription;

  useEffect(() => {
    if (loadingCanPropose || canPropose !== null) return;

    const _canPropose = async () => {
      setLoadingCanPropose(true);
      const params = {
        strategyName: auction.propStrategy.strategyName,
        account,
        provider,
        ...auction.propStrategy,
      };

      try {
        setCanPropose((await execStrategy(params)) > 0);
      } catch (e) {
        console.log(e);
      }
      setLoadingCanPropose(false);
    };
    _canPropose();
  }, [account, loadingCanPropose, auction.propStrategy, provider, canPropose]);

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
          <p>{votingCopy}</p>
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
              loadingCanPropose ? (
                <div className={classes.loadingCopy}>
                  Verifying account requirements
                  <LoadingIndicator height={30} width={30} />
                </div>
              ) : canPropose && !loadingCanPropose ? (
                'Create your proposal'
              ) : (
                'Your account is not eligible to submit a proposal'
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
