import classes from './AcceptingPropsModule.module.css';

import { useDispatch } from 'react-redux';
import { clearProposal } from '../../state/slices/editor';
import Button, { ButtonColor } from '../Button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RoundModuleCard from '../RoundModuleCard';

import ConnectButton from '../ConnectButton';
import { useAccount } from 'wagmi';
import { useAppSelector } from '../../hooks';
import LoadingIndicator from '../LoadingIndicator';
import { BsPersonFill, BsFillAwardFill } from 'react-icons/bs';
import { MdHowToVote } from 'react-icons/md';
import { ReactMarkdown } from 'react-markdown/lib/react-markdown';
import { Round, Timed } from '@prophouse/sdk-react';
import useCanPropose from '../../hooks/useCanPropose';

const InfRoundAcceptingPropsModule: React.FC<{
  round: Round;
}> = props => {
  const { round } = props;

  const proposals = useAppSelector(state => state.propHouse.activeProposals);
  const isProposingWindow = round.state === Timed.RoundState.IN_PROPOSING_PERIOD;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { address: account } = useAccount();
  const { t } = useTranslation();
  const [loadingCanPropose, errorLoadingCanPropose, canPropose] = useCanPropose(round, account);

  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsPersonFill color="" />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={'proposingCopy'} />
          </p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <MdHowToVote />
          </div>
          <p>
            <ReactMarkdown className="markdown" children={'votingCopy'} />
          </p>
        </div>

        <div className={classes.listItem}>
          <div className={classes.icon}>
            <BsFillAwardFill />
          </div>
          <p>'Proposals that meet quorum will get funded.'</p>
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
              navigate('/create-prop');
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
      subtitle={<>Until funding is depleted</>}
      content={content}
      type="proposing"
    />
  );
};

export default InfRoundAcceptingPropsModule;
