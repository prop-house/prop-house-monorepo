import Divider from '../../Divider';
import Text from '../Text';

const Header: React.FC<{
  title: string;
  subtitle?: string;
  content?: any;
}> = props => {
  const { title, subtitle, content } = props;

  return (
    <>
      {title && <Text type="title">{title}</Text>}
      {subtitle && <Text type="body">{subtitle}</Text>}
      {content && content}
      <Divider narrow />
    </>
  );
};

export default Header;
