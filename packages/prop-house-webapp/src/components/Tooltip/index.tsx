import { OverlayTrigger, Tooltip as TooltipBS } from 'react-bootstrap';
import clsx from 'clsx';
import classes from './Tooltip.module.css';

const Tooltip: React.FC<{
  content: string;
  contentClass: string;
  tooltipContent: string;
}> = (props) => {
  const { content, contentClass, tooltipContent } = props;
  return (
    <OverlayTrigger
      trigger="hover"
      placement="top"
      overlay={
        <TooltipBS className={classes.tooltip}>
          <span className={classes.tooltipTitle}>TL;DR</span>
          {tooltipContent}
        </TooltipBS>
      }
    >
      <div className={clsx(contentClass, classes.content)}>{content}</div>
    </OverlayTrigger>
  );
};
export default Tooltip;
