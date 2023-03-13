import classes from './RoundModuleCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { ReactElement } from 'react-markdown/lib/react-markdown';

const RoundModuleCard: React.FC<{ content: ReactElement; buttons?: ReactElement }> = props => {
  return (
    <Card
      bgColor={CardBgColor.White}
      borderRadius={CardBorderRadius.thirty}
      classNames={classes.sidebarContainerCard}
    >
      {props.content}
      {props.buttons}
    </Card>
  );
};
export default RoundModuleCard;
