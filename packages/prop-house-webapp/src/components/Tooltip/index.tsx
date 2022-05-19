import { OverlayTrigger, Tooltip as TooltipBS } from 'react-bootstrap';
import classes from './Tooltip.module.css';
import React from 'react';

const Tooltip: React.FC<{
  content: React.ReactNode;
  tooltipTitle?: string;
  tooltipContent: string;
}> = (props) => {
  const { content, tooltipTitle, tooltipContent } = props;
  return (
    <OverlayTrigger
      trigger={['hover', 'focus']}
      placement="top"
      overlay={
        <TooltipBS className={classes.tooltip}>
          <span className={classes.tooltipTitle}>{tooltipTitle}</span>
          {tooltipContent}
        </TooltipBS>
      }
    >
      <div>{content}</div>
    </OverlayTrigger>
  );
};
export default Tooltip;
