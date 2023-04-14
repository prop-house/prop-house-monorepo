import { useState } from 'react';
import classes from './Reply.module.css';
import Modal from '../Modal';
import { Form } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';

import { useBlockNumber, useSigner } from 'wagmi';
import { useAppSelector } from '../../hooks';
import { Reply } from '@nouns/prop-house-wrapper/dist/builders';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

const RepliesContainer: React.FC<{ propId: number }> = props => {
  const { propId } = props;
  const { data: signer } = useSigner();
  const { data: blockNumber } = useBlockNumber();

  const activeCommmunity = useAppSelector(state => state.propHouse.activeCommunity);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [comment, setComment] = useState('');

  const handleReplyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleReplySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signer || !activeCommmunity || !blockNumber) return;

    const address = await signer.getAddress();
    if (!address) return;

    const wrapper = new PropHouseWrapper('', signer);
    const reply = new Reply(activeCommmunity.contractAddress, blockNumber, propId, comment);
    await wrapper.submitReply(signer, reply);
    setComment('');
  };

  const replyModal = (
    <Modal
      title="Reply"
      subtitle="Add a reply to proposal"
      setShowModal={setShowReplyModal}
      body={
        <>
          <Form onSubmit={handleReplySubmit}>
            <Form.Group>
              <Form.Control
                as="textarea"
                id="comment-input"
                value={comment}
                onChange={handleReplyChange}
                style={{ height: '100px' }}
              />
            </Form.Group>
          </Form>
        </>
      }
      button={
        <Button
          text="Cancel"
          bgColor={ButtonColor.White}
          onClick={() => setShowReplyModal(false)}
        />
      }
      secondButton={
        <Button text="Submit" bgColor={ButtonColor.Purple} onClick={e => handleReplySubmit(e)} />
      }
    />
  );

  return (
    <>
      {showReplyModal && replyModal}
      <div className={classes.container}>
        <div className={classes.replies}>6 replies</div>
        <div className={classes.reply} onClick={() => setShowReplyModal(true)}>
          Reply
        </div>
      </div>
    </>
  );
};

export default RepliesContainer;
