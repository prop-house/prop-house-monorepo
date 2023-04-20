import { useEffect, useRef, useState } from 'react';
import classes from './ReplyBar.module.css';
import Modal from '../Modal';
import ReactLoading from 'react-loading';
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
import { FiArrowUp, FiCheck } from 'react-icons/fi';
import { NounImage } from '../../utils/getNounImage';
import ErrorVotingModal from '../ErrorVotingModal';

const ReplyBar: React.FC<{ proposal: StoredProposal }> = props => {
  const { proposal } = props;
  const { data: signer } = useSigner();

  const activeCommmunity = useAppSelector(state => state.propHouse.activeCommunity);
  const activeRound = useAppSelector(state => state.propHouse.activeRound);
  const wrapper = new PropHouseWrapper('', signer);

  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [submissionBtnDisabled, setSubmissionBtnDisabled] = useState(true);
  const repliesModalBodyRef = useRef<HTMLDivElement>(null);

  const [comment, setComment] = useState('');
  const [replies, setReplies] = useState<StoredReply[]>([]);

  const handleReplyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
    if (event.target.value.length > 0) setSubmissionBtnDisabled(false);
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
      setLoadingSubmission(true);
      await wrapper.submitReply(signer, reply);
      setLoadingSubmission(false);
      setComment('');
      if (repliesModalBodyRef && repliesModalBodyRef.current)
        repliesModalBodyRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (e) {
      setLoadingSubmission(false);
      setShowRepliesModal(false);
      setShowErrorModal(true);
    }
  };

  useEffect(() => {
    const fetchReplies = async () => {
      const replies = await wrapper.fetchReplies(proposal.id);
      setReplies(replies);
    };
    fetchReplies();
  }, [loadingSubmission]);

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
        <button
          className={classes.submitCommentBtn}
          onClick={(e: any) => handleReplySubmit(e)}
          disabled={submissionBtnDisabled}
        >
          {loadingSubmission ? (
            <ReactLoading
              type={'spin'}
              color="white"
              height={16}
              width={16}
              className={classes.loadingIcon}
            />
          ) : (
            <FiArrowUp color="white" size={16} />
          )}
        </button>
      </form>
    </div>
  );

  const repliesModal = (
    <Modal
      title={proposal.title}
      subtitle={`${replies.length} comment${replies.length === 1 ? '' : 's'}`}
      setShowModal={setShowRepliesModal}
      body={
        replies.length === 0 ? (
          replyContainer
        ) : (
          <div className={classes.repliesModalBodyContainer} ref={repliesModalBodyRef}>
            {replies.map(r => (
              <Reply reply={r} />
            ))}
          </div>
        )
      }
      bottomContainer={replies.length === 0 ? <></> : replyContainer}
    />
  );

  const errorModal = (
    <Modal
      title={'Failed to submit comment'}
      subtitle={
        'Please make sure you either have voting power in this round or that you are the proposer of this proposal.'
      }
      image={NounImage.Banana}
      setShowModal={setShowErrorModal}
    />
  );

  return (
    <>
      {showRepliesModal && repliesModal}
      {showErrorModal && errorModal}
      <div className={classes.container} onClick={() => setShowRepliesModal(true)}>
        <div className={classes.replies}>
          <span>
            <BiComment size={14} />
          </span>
          {`${replies.length} comment${replies.length === 1 ? '' : 's'}`}
        </div>
      </div>
    </>
  );
};

export default ReplyBar;
