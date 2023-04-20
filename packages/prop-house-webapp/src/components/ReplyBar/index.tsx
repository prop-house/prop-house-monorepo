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
import { BiComment } from 'react-icons/bi';
import { FiArrowUp } from 'react-icons/fi';

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

  const replyContainer = (
    <div className={classes.replyContainer}>
      <form className={classes.formContainer}>
        <textarea
          className={classes.commentInput}
          value={comment}
          onChange={handleReplyChange}
          rows={3}
          placeholder="Write a comment"
        />
        <button className={classes.submitCommentBtn} onClick={(e: any) => handleReplySubmit(e)}>
          <FiArrowUp color="white" size={16} />
        </button>
      </form>
    </div>
  );

  const repliesModal = (
    <Modal
      title={proposal.title}
      subtitle={`${replies.length} comments`}
      setShowModal={setShowRepliesModal}
      body={
        <div className={classes.repliesModalBodyContainer}>
          {replies.map(r => (
            <Reply reply={r} />
          ))}
        </div>
      }
      bottomContainer={replyContainer}
    />
  );

  return (
    <>
      {showRepliesModal && repliesModal}
      <div className={classes.container} onClick={() => setShowRepliesModal(true)}>
        <div className={classes.replies}>
          <span>
            <BiComment size={14} />
          </span>
          {`${replies.length} comments`}
        </div>
      </div>
    </>
  );
};

export default ReplyBar;
