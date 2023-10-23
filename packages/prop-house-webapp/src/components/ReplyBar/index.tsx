import { useEffect, useRef, useState } from 'react';
import classes from './ReplyBar.module.css';
import Modal from '../Modal';
import ReactLoading from 'react-loading';
import { useEthersSigner } from '../../hooks/useEthersSigner';
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
import Avatar from '../Avatar';
import { isTimedAuction } from '../../utils/auctionType';
import { auctionStatus, AuctionStatus } from '../../utils/auctionStatus';
import { isActiveProp } from '../../utils/isActiveProp';
import { useEthersProvider } from '../../hooks/useEthersProvider';

const ReplyBar: React.FC<{ proposal: StoredProposal }> = props => {
  const { proposal } = props;
  const signer = useEthersSigner();

  const activeCommmunity = useAppSelector(state => state.propHouse.activeCommunity);
  const activeRound = useAppSelector(state => state.propHouse.activeRound);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const wrapper = useRef(new PropHouseWrapper(''));
  const provider = useEthersProvider({
    chainId: activeRound
      ? activeRound.voteStrategy.chainId
        ? activeRound.voteStrategy.chainId
        : 1
      : 1,
  });

  const [showRepliesModal, setShowRepliesModal] = useState(false);
  const [repliesAddresses, setRepliesAddresses] = useState<string[]>([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [loadingSubmission, setLoadingSubmission] = useState(false);
  const [submissionBtnDisabled, setSubmissionBtnDisabled] = useState(true);
  const [commentInputDisabled, setCommentInputDisabled] = useState(true);
  const [canComment, setCanComment] = useState(false);
  const [shouldFetchReplies, setShouldFetchReplies] = useState(true);
  const repliesModalBodyRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState('');
  const [replies, setReplies] = useState<StoredReply[]>([]);

  const isInCommentPeriod = () => {
    if (!activeRound) return false;
    const status = auctionStatus(activeRound);
    return isTimedAuction(activeRound)
      ? status === AuctionStatus.AuctionAcceptingProps || status === AuctionStatus.AuctionVoting
      : isActiveProp(proposal, activeRound);
  };

  useEffect(() => {
    wrapper.current = new PropHouseWrapper('', signer);
  }, [signer]);

  useEffect(() => {
    if (!signer) return;

    const checkCanComment = async () => {
      const address = await signer.getAddress();
      setCanComment(votingPower > 0 || proposal.address === address);
    };
    checkCanComment();
  }, [signer, votingPower, proposal]);

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

    const strategyParams = {
      strategyName: activeRound.voteStrategy.strategyName,
      account: signer._address,
      provider,
      ...activeRound.voteStrategy,
    };

    try {
      setLoadingSubmission(true);
      await wrapper.current.submitReply(signer, reply, strategyParams);
      setLoadingSubmission(false);
      setComment('');
      setShouldFetchReplies(true);
      if (repliesModalBodyRef && repliesModalBodyRef.current)
        repliesModalBodyRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    } catch (e) {
      setComment('');
      setLoadingSubmission(false);
      setShowRepliesModal(false);
      setShowErrorModal(true);
    }
  };

  // update replies on prop change
  useEffect(() => {
    setReplies([]);
    setShouldFetchReplies(true);
  }, [proposal.id]);

  // fetch replies
  useEffect(() => {
    if (!shouldFetchReplies) return;
    const fetchReplies = async () => {
      const res = await wrapper.current.fetchReplies(proposal.id);
      const sorted = res.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      setReplies(sorted);

      const shuffledReplies = replies.sort(() => Math.random() - 0.5);
      const addresses = shuffledReplies.slice(0, 10).map(r => r.address);
      setRepliesAddresses(addresses);
      setShouldFetchReplies(false);
    };
    fetchReplies();
  }, [loadingSubmission, wrapper, proposal, replies, shouldFetchReplies]);

  // disable submit button if no signer (walletClient) or no comment
  useEffect(() => {
    setCommentInputDisabled(signer ? false : true);
  }, [signer, comment, shouldFetchReplies]);

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

  const handleClose = () => {
    setComment('');
    setShowRepliesModal(false);
  };

  const repliesModal = (
    <Modal
      title={proposal.title}
      subtitle={`${replies.length} comment${replies.length !== 1 ? 's' : ''}`}
      setShowModal={setShowRepliesModal}
      body={
        replies.length === 0 ? (
          <div className={classes.noCommentsContainer}>
            <img src={NounImage.Blackhole.src} alt={NounImage.Blackhole.alt} />
            <div className={classes.noCommentsText}>No comments yet</div>
          </div>
        ) : (
          <div className={classes.repliesModalBodyContainer} ref={repliesModalBodyRef}>
            {replies.map((r, i) => (
              <Reply reply={r} isProposer={proposal.address === r.address} key={i} />
            ))}
          </div>
        )
      }
      handleClose={handleClose}
      bottomContainer={
        isInCommentPeriod() ? (
          !signer ? (
            <div className={classes.replyModalBottomRow}>
              Please connect your wallet to comment.
            </div>
          ) : canComment ? (
            replyContainer
          ) : (
            <div className={classes.replyModalBottomRow}>
              Only the proposer or accounts with voting power can comment.
            </div>
          )
        ) : (
          <div className={classes.replyModalBottomRow}>
            Proposal is closed for comments - thank you!
          </div>
        )
      }
      fullScreenOnMobile={true}
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
          {repliesAddresses.map((address, i) => (
            <Avatar key={i} diameter={12} address={address} />
          ))}
        </div>
      </div>
    </>
  );
};

export default ReplyBar;
