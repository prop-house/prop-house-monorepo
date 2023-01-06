import classes from './ReadMore.module.css';
import { useLayoutEffect, useRef, useState } from 'react';

const ReadMore: React.FC<{
  description: JSX.Element;
}> = props => {
  const { description } = props;

  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const [showLink, setShowLink] = useState(false);

  useLayoutEffect(() => {
    // @ts-ignore
    if (ref.current && ref.current.clientHeight < ref.current.scrollHeight) {
      setShowLink(true)
    }
  }, [ref])

  let classNames = classes.readMoreText;
  if (open) {
    classNames += classes.clampLine;
  }

  return (
    <div className={classes.readMoreContainer}>
      <div className={classNames} ref={ref}> {description} </div>

      {showLink &&
        <div className={classes.readMoreLessButton} onClick={() => setOpen(!open)} >
          {open ? 'Read less' : 'Read more'}
        </div>
      }
    </div>

  );
};

export default ReadMore;
