import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import classes from './BrowseControl.module.css';
import React from 'react';

const BrowseControl: React.FC<{ auctionId: number; highestId: number }> = (
  props
) => {
  const { auctionId, highestId } = props;
  return (
    <Row>
      <Col xl={12}>
        <div className={classes.controlContainer}>
          <h1>Browse </h1>
          <Link
            to={`/auction/${auctionId - 1}`}
            className={clsx(
              auctionId <= 1 ? classes.navDisabled : classes.navEnabled,
              classes.arrow
            )}
          >
            ←
          </Link>
          <Link
            to={`/auction/${auctionId + 1}`}
            className={clsx(
              auctionId >= highestId ? classes.navDisabled : classes.navEnabled,
              classes.arrow
            )}
          >
            →
          </Link>
        </div>

        <p>Discover proposals & winners from previous auctions.</p>
      </Col>
    </Row>
  );
};

export default BrowseControl;
