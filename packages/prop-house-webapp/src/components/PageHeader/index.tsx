import classes from './PageHeader.module.css';
import { Row } from 'react-bootstrap';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <Row className={classes.headerRow}>
      <h1 className={classes.pageTitle}>{title}</h1>
      <p className={classes.pageSubtitle}>{subtitle}</p>
    </Row>
  );
};

export default PageHeader;
