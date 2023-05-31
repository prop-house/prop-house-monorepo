import classes from './RoundModuleCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { MdOutlineLightbulb as BulbIcon } from 'react-icons/md';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import { FiAward } from 'react-icons/fi';
import { GiDeadHead } from 'react-icons/gi';
import { AiOutlineClockCircle } from 'react-icons/ai';
import clsx from 'clsx';

const RoundModuleCard: React.FC<{
  title: string | ReactElement;
  subtitle?: string | ReactElement;
  content: ReactElement;
  type: 'proposing' | 'voting' | 'ended' | 'winner' | 'rejected' | 'stale';
}> = props => {
  const { title, subtitle, content, type } = props;
  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.thirty}
      classNames={classes.sidebarContainerCard}
    >
      <>
        <div className={classes.sideCardHeader}>
          <div
            className={clsx(
              classes.icon,
              type === 'proposing' || type === 'winner'
                ? classes.greenIcon
                : type === 'voting'
                ? classes.purpleIcon
                : type === 'stale' || type === 'rejected'
                ? classes.grayIcon
                : classes.blackIcon,
            )}
          >
            {type === 'proposing' ? (
              <BulbIcon />
            ) : type === 'winner' ? (
              <FiAward />
            ) : type === 'rejected' ? (
              <GiDeadHead />
            ) : type === 'stale' ? (
              <AiOutlineClockCircle />
            ) : (
              <VoteIcon />
            )}
          </div>
          <div className={classes.textContainer}>
            <div className={classes.title}>{title}</div>
            <div className={classes.subtitle}>{subtitle}</div>
          </div>
        </div>
        <hr className={classes.divider} />
      </>
      <div className={classes.sideCardBody}>{content}</div>
    </Card>
  );
};
export default RoundModuleCard;
