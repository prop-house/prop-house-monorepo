import classes from './AcceptingPropsModule.module.css';
import { Community, StoredAuctionBase } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus, auctionStatus } from '../../utils/auctionStatus';
import { useDispatch } from 'react-redux';
import { clearProposal } from '../../state/slices/editor';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';
import clsx from 'clsx';
import { isInfAuction } from '../../utils/auctionType';
import { MdOutlineLightbulb as BulbIcon } from 'react-icons/md';
import dayjs from 'dayjs';
import ConnectButton from '../ConnectButton';
import { useAccount } from 'wagmi';

const AcceptingPropsModule: React.FC<{
  auction: StoredAuctionBase;
  community: Community;
}> = props => {
  const { auction, community } = props;

  const isProposingWindow = auctionStatus(auction) === AuctionStatus.AuctionAcceptingProps;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();

  const content = (
    <div className={classes.content}>
      <>
        <div className={classes.sideCardHeader}>
          <div className={clsx(classes.icon, classes.greenIcon)}>
            <BulbIcon />
          </div>
          <div className={classes.textContainer}>
            <p className={classes.title}>{t('acceptingProposals')}</p>
            <p className={classes.subtitle}>
              Until{' '}
              {isInfAuction(auction)
                ? 'funding is depleted'
                : dayjs(auction.proposalEndTime).format('MMMM D')}
            </p>
          </div>
        </div>

        <hr className={classes.divider} />

        <p className={classes.sideCardBody}>
          <b>{t('howProposingWorks')}:</b>

          <div className={classes.bulletList}>
            <div className={classes.bulletItem}>
              <hr className={classes.bullet} />
              <p>{t('anyoneCanSubmit')}.</p>
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
        </p>
      </>
    </div>
  );

  const buttons = (
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
          <ConnectButton color={ButtonColor.Pink} />
        ))}
    </div>
  );

  return <RoundModuleCard content={content} buttons={buttons} />;
};

export default AcceptingPropsModule;
