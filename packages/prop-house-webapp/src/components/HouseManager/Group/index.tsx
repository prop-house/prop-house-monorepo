import { CSSProperties } from 'react';

/**
 * @overview
 * Tailwind-like helper component to group components together. Defaults to flex column layout.
 *
 * @props
 * @name children - whatever it's wrapping
 * @name gap - gap between components
 * @name mt,mb - margin top OR bottom
 * @name margin - margin top AND bottom
 * @name row - boolean to change to row layout
 * @name classNames - custom classnames
 */

const Group: React.FC<{
  children: React.ReactNode;
  gap?: number;
  mt?: number;
  mb?: number;
  margin?: number;
  row?: boolean;
  classNames?: string;
}> = props => {
  const { children, gap, mt, mb, margin, row, classNames } = props;

  const gapValue = gap ? `${gap}px` : undefined;

  let marginValue;
  if (margin) {
    marginValue = `${margin}px 0`;
  } else {
    marginValue = `${mt ?? 0}px 0px ${mb ?? 0}px 0px`;
  }

  const styles: CSSProperties = {
    display: 'flex',
    flexDirection: row ? 'row' : 'column',
    gap: gapValue,
    margin: marginValue,
  };

  return (
    <div style={styles} className={classNames}>
      {children}
    </div>
  );
};

export default Group;
