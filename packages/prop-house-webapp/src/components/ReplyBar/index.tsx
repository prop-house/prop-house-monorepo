import { useEffect, useState } from 'react';
import classes from './ReplyBar.module.css';
import Modal from '../Modal';
import { Form } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import { useSigner } from 'wagmi';
import { useAppSelector } from '../../hooks';
import {
  Reply as ReplyType,
  StoredProposal,
  StoredReply,
} from '@nouns/prop-house-wrapper/dist/builders';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import Reply from '../Reply';

const ReplyBar: React.FC<{ proposal: StoredProposal }> = props => {
  const { proposal } = props;
  const { data: signer } = useSigner();

  const activeCommmunity = useAppSelector(state => state.propHouse.activeCommunity);
  const activeRound = useAppSelector(state => state.propHouse.activeRound);
  const wrapper = new PropHouseWrapper('', signer);

  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [comment, setComment] = useState('');
  const [replies, setReplies] = useState<StoredReply[]>([]);

  const handleReplyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
  };

  const handleReplySubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!signer || !activeCommmunity || !activeRound) return;

    const address = await signer.getAddress();
    if (!address) return;

    const reply = new ReplyType(
      activeCommmunity.contractAddress,
      activeRound.balanceBlockTag,
      proposal.id,
      comment,
    );
    try {
      await wrapper.submitReply(signer, reply);
      setComment('');
      setShowReplyModal(false);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const fetchReplies = async () => {
      const replies = await wrapper.fetchReplies(proposal.id);
      setReplies(replies);
    };
    fetchReplies();
  }, []);

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

  const repliesModal = (
    <Modal
      title={`Reply`}
      subtitle={`Replies to ${proposal.title}`}
      setShowModal={setShowRepliesModal}
      body={
        <>
          {replies.map(r => (
            <Reply reply={r} />
          ))}
        </>
      }
      button={
        <Button
          text="Cancel"
          bgColor={ButtonColor.White}
          onClick={() => setShowRepliesModal(false)}
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
      {showRepliesModal && repliesModal}
      <div className={classes.container}>
        <div
          className={classes.replies}
          onClick={() => setShowRepliesModal(true)}
        >{`${replies.length} replies`}</div>
        <div className={classes.reply} onClick={() => setShowReplyModal(true)}>
          Reply
        </div>
      </div>
    </>
  );
};

export default ReplyBar;
