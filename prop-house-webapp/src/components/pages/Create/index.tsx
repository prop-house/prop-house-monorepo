import classes from './Create.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import { Row, Col, Tabs, Tab } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import ProposalEditor from '../../ProposalEditor';
import Preview from '../Preview';

const Create = () => {
  const [titleText, setTitleText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [previewDisabled, setPreviewDisable] = useState(true);
  const [selectedTabKey, setSelectedTabKey] = useState<string | null>(
    'edit-proposal'
  ); // default selected tab

  const onTitleChange = (title: string) => {
    setTitleText(title);
    setPreviewDisable(title === '' || bodyText === '');
  };
  const onBodyChange = (body: string) => {
    setBodyText(body);
    setPreviewDisable(body === '' || titleText === '');
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
          <div className={classes.tabsContainer}>
            <Tabs
              defaultActiveKey="edit-proposal"
              className="mb-3"
              transition={true}
              onSelect={(key) => setSelectedTabKey(key)}
            >
              <Tab
                eventKey="edit-proposal"
                title="Edit proposal"
                tabClassName={
                  selectedTabKey === 'edit-proposal'
                    ? classes.activeTab
                    : classes.inactiveTab
                }
              >
                <ProposalEditor
                  onTitleChange={onTitleChange}
                  onBodyChange={onBodyChange}
                />
              </Tab>
              <Tab
                eventKey="preview"
                title="Preview"
                disabled={previewDisabled}
                tabClassName={
                  selectedTabKey === 'preview'
                    ? classes.activeTab
                    : previewDisabled
                    ? classes.previewDisabledTab
                    : classes.inactiveTab
                }
              >
                <Preview title={titleText} body={bodyText} />
              </Tab>
            </Tabs>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xl={12} className={classes.connectBtnContainer}>
          <Button
            text="Connect wallet"
            bgColor={ButtonColor.Pink}
            disabled={previewDisabled}
          />
          <span>to submit</span>
        </Col>
      </Row>
    </>
  );
};

export default Create;
