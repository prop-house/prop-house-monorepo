import classes from './ReadMore.module.css';
import { useState } from 'react';

const ReadMore: React.FC<{
  description: JSX.Element;
}> = props => {
  const { description } = props;

  const [readMore, setReadMore] = useState(false);
  return (
    <div className={classes.readMoreContainer}>
      <div className={readMore ? '' : classes.clampLine}>
        {description}
      </div>

      <div className={classes.readMoreLessButton} onClick={() => setReadMore(!readMore)}>{readMore ? 'Read less' : 'Read more'}</div>
    </div>

  );
};

export default ReadMore;
