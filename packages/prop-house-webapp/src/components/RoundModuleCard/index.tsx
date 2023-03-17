import classes from './RoundModuleCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { ReactElement } from 'react-markdown/lib/react-markdown';
import { MdOutlineLightbulb as BulbIcon } from 'react-icons/md';
import { MdHowToVote as VoteIcon } from 'react-icons/md';
import clsx from 'clsx';

const RoundModuleCard: React.FC<{
  title: string | ReactElement;
  subtitle: string | ReactElement;
  content: ReactElement;
  type: 'proposing' | 'voting' | 'ended';
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
              type === 'proposing'
                ? classes.greenIcon
                : type === 'voting'
                ? classes.purpleIcon
                : classes.blackIcon,
            )}
          >
            {type === 'proposing' ? <BulbIcon /> : <VoteIcon />}
          </div>
          <div className={classes.textContainer}>
            <p className={classes.title}>{title}</p>
            <p className={classes.subtitle}>{subtitle}</p>
          </div>
        </div>
        <hr className={classes.divider} />
      </>
      <p className={classes.sideCardBody}>{content}</p>
    </Card>
  );
};
export default RoundModuleCard;
