import { useState } from 'react';
import classes from './Reply.module.css';
import Modal from '../Modal';
import { Form } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';

const Reply: React.FC<{}> = () => {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [comment, setComment] = useState('');

  const handleReplyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleReplySubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setComment('');
    /// handle submit
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
      secondButton={<Button text="Submit" bgColor={ButtonColor.Purple} />}
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

export default Reply;
