import classes from './Create.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import { Row, Col } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ProposalEditor from '../../ProposalEditor';
import Preview from '../Preview';

export interface PropData {
  title: string;
  who: string;
  what: string;
  timeline: string;
  links: string;
}

const emptyPropData = (): PropData => ({
  title: '',
  who: '',
  what: '',
  timeline: '',
  links: '',
});

const isValidPropData = (data: PropData) => {
  return data.title !== '' && data.what !== '';
};

const Create = () => {
  const [propData, setPropData] = useState<PropData>(emptyPropData());
  const [showPreview, setShowPreview] = useState(false);

  const onDataChange = (data: {}) => {
    setPropData((prev) => {
      const updatedPropData = {
        ...prev,
        ...data,
      };
      return updatedPropData;
    });
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <h1>Create proposal for Auction 1</h1>
          <p>Proposals will be voted by Nouners to get funded</p>
        </Col>
      </Row>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={classes.card}
      >
        <Row>
          <Col xl={10}>
            <p>
              We encourage proposals which further proliferate Nouns onto the
              world while accurately representing the Nouns culture. If your
              proposal is chosen, you will be given the responsibility of
              completing the work you’ve outlined below. Please be descriptive!
            </p>
          </Col>
          <Col xl={2}>
            <Link to="/learn">
              <Button text="Learn more" bgColor={ButtonColor.White} />
            </Link>
          </Col>
        </Row>
      </Card>

      <Row>
        <Col xl={12}>
          {showPreview ? (
            <Preview propData={propData} />
          ) : (
            <ProposalEditor onDataChange={onDataChange} data={propData} />
          )}
        </Col>
      </Row>

      <Row>
        <Col xl={12} className={classes.btnContainer}>
          <Button
            text={showPreview ? 'Back to editor' : 'Preview'}
            bgColor={ButtonColor.Pink}
            onClick={() =>
              setShowPreview((prev) => {
                return !prev;
              })
            }
            disabled={!isValidPropData(propData)}
          />
        </Col>
      </Row>
    </>
  );
};

export default Create;
