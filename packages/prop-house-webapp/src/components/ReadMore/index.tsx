import classes from './ReadMore.module.css';
import { useLayoutEffect, useRef, useState } from 'react';
import clsx from 'clsx';

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
      setShowLink(true);
    }
  }, [ref]);

  return (
    <div className={classes.readMoreContainer}>
      <div className={clsx(classes.readMoreText, open && classes.clampLine)} ref={ref}>
        {description}
      </div>

      {showLink && (
        <div className={classes.readMoreLessButton} onClick={() => setOpen(!open)}>
          {open ? 'Read less' : 'Read more'}
        </div>
      )}
    </div>
  );
};

export default ReadMore;
