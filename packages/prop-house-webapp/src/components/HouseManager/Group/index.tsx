import { CSSProperties } from 'react';

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
