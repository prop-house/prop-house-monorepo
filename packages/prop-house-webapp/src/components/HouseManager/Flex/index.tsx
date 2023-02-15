import { CSSProperties } from 'react';

const Flex: React.FC<{
  children: React.ReactNode;
  gap?: number;
  column?: boolean;
}> = props => {
  const { children, gap, column } = props;

  const gapValue = gap ? `${gap}px` : undefined;

  const styles: CSSProperties = {
    display: 'flex',
    flexDirection: column ? 'column' : 'row',
    gap: gapValue,
  };

  return <div style={styles}>{children}</div>;
};

export default Flex;
