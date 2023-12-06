import classes from './PageHeader.module.css';
import { Col, Row } from 'react-bootstrap';

interface PageHeaderProps {
  title: string;
  subtitle: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle }) => {
  return (
    <Row className={classes.headerRow}>
      <Col>
        <div className={classes.pageTitle}>{title}</div>
        <p className={classes.pageSubtitle}>{subtitle}</p>
      </Col>
    </Row>
  );
};

export default PageHeader;
