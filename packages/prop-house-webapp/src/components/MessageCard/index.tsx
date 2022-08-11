import classes from './MessageCard.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';

interface MessageCardProps {
  message: string;
}

const MessageCard = ({ message }: MessageCardProps) => {
  return (
    <Card bgColor={CardBgColor.White} borderRadius={CardBorderRadius.twenty} classNames="">
      <div className={classes.message}>{message}</div>
    </Card>
  );
};

export default MessageCard;
