import { useEffect, useRef, useState } from 'react';
import classes from './ReplyBar.module.css';
import Modal from '../Modal';
import ReactLoading from 'react-loading';
import { useEnsAvatar, useSigner } from 'wagmi';
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
import { NounImage } from '../../utils/getNounImage';
import Jazzicon from 'react-jazzicon/dist/Jazzicon';
import { jsNumberForAddress } from 'react-jazzicon';

const Avatar: React.FC<{ address: string }> = props => {
  const { address } = props;
  const { data } = useEnsAvatar({
    address: `0x${address.substring(2)}`,
  });

  return data ? (
    <img key={address} src={data} alt={`Avatar for ${address}`} />
  ) : (
    <Jazzicon diameter={12} seed={jsNumberForAddress(address)} />
  );
};

const ReplyBar: React.FC<{ proposal: StoredProposal }> = props => {
  const { proposal } = props;
  const { data: signer } = useSigner();

  const activeCommmunity = useAppSelector(state => state.propHouse.activeCommunity);
  const activeRound = useAppSelector(state => state.propHouse.activeRound);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const wrapper = new PropHouseWrapper('', signer);

  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [repliesAddresses, setRepliesAddresses] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [submissionBtnDisabled, setSubmissionBtnDisabled] = useState(true);
  const [commentInputDisabled, setCommentInputDisabled] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const repliesModalBodyRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState('');
  const [replies, setReplies] = useState<StoredReply[]>([]);

  useEffect(() => {
    if (!signer) return;

    const checkCanComment = async () => {
      const address = await signer.getAddress();
      setCanComment(votingPower > 0 || proposal.address === address);
    };
    checkCanComment();
  }, [signer, votingPower]);

  const handleReplyChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(event.target.value);
    if (event.target.value.length > 0 && signer) setSubmissionBtnDisabled(false);
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

  // fetch replies
  useEffect(() => {
    const fetchReplies = async () => {
      const replies = await wrapper.fetchReplies(proposal.id);
      const sorted = replies.sort((a, b) => (b.createdAt < a.createdAt ? 1 : -1));
      setReplies(sorted);
      const shuffledReplies = replies.sort(() => Math.random() - 0.5);
      const addresses = shuffledReplies.slice(0, 10).map(r => r.address);
      setRepliesAddresses(addresses);
    };
    fetchReplies();
  }, [loadingSubmission]);

  // disable submit button if no signer or no comment
  useEffect(() => {
    setCommentInputDisabled(signer ? false : true);
  }, [signer, comment]);

  const replyContainer = (
    <div className={classes.replyContainer}>
      <form className={classes.formContainer}>
        <textarea
          className={classes.commentInput}
          value={comment}
          onChange={handleReplyChange}
          rows={3}
          placeholder={signer ? `Write a comment` : `Connect your wallet to comment!`}
          disabled={commentInputDisabled}
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
      subtitle={`${replies.length} comments`}
      setShowModal={setShowRepliesModal}
      body={
        replies.length === 0 ? (
          <div className={classes.noCommentsContainer}>
            <img src={NounImage.Blackhole.src} alt={NounImage.Blackhole.alt} />
            <div className={classes.noCommentsText}>No comments yet...</div>
          </div>
        ) : (
          <div className={classes.repliesModalBodyContainer} ref={repliesModalBodyRef}>
            {replies.map(r => (
              <Reply reply={r} />
            ))}
          </div>
        )
      }
      onRequestClose={() => {
        setComment('');
        setShowRepliesModal(false);
      }}
      bottomContainer={
        signer ? (
          canComment ? (
            replyContainer
          ) : (
            <div className={classes.replyModalBottomRow}>
              Only accounts with voting power or the proposer can comment.
            </div>
          )
        ) : (
          <div className={classes.replyModalBottomRow}>Please connect your wallet to comment.</div>
        )
      }
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
        <div className={classes.avatarContainer}>
          {repliesAddresses.map(address => (
            <Avatar key={address} address={address} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ReplyBar;
