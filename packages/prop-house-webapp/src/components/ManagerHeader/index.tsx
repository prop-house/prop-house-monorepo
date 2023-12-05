import classes from './ManagerHeader.module.css';
import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { FaArrowRightLong, FaArrowUpRightFromSquare } from 'react-icons/fa6';
import { useNavigate } from 'react-router-dom';
import { openInNewTab } from '../../utils/openInNewTab';
import buildEtherscanPath from '../../utils/buildEtherscanPath';
import trimEthAddress from '../../utils/trimEthAddress';
import Button, { ButtonColor } from '../Button';

interface ManagerHeaderProps {
  title: string;
  imgUrl: string;
  address: string;
}

const ManagerHeader: React.FC<ManagerHeaderProps> = ({ title, imgUrl, address }) => {
  const navigate = useNavigate();

  return (
    <>
      <Row>
        <Col className={classes.linksCol}>
          <span onClick={() => navigate('/dashboard')}>
            Dashboard <FaArrowRightLong size={12} />
          </span>
          <span>{title}</span>
        </Col>
      </Row>
      <Row>
        <Col className={classes.headerCol}>
          <div className={classes.leftCol}>
            <img src={imgUrl} className={classes.houseImg} alt={title} />
            <div>
              <div className={classes.roundName}>{title}</div>
              <div
                className={classes.address}
                onClick={() => openInNewTab(buildEtherscanPath(address))}
              >
                {trimEthAddress(address, 'long')} <FaArrowUpRightFromSquare size={12} />
              </div>
            </div>
          </div>
          <div onClick={() => navigate(`/${address}`)}>
            <Button text={<>View round</>} bgColor={ButtonColor.Gray} />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ManagerHeader;
