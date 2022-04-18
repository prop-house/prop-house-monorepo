import classes from './ProposalCard.module.css';
import globalClasses from '../../css/globals.module.css';
import Card, { CardBgColor, CardBorderRadius } from '../Card';
import { Link, useNavigate } from 'react-router-dom';
import {
  StoredProposal,
  StoredProposalWithVotes,
} from '@nouns/prop-house-wrapper/dist/builders';
import diffTime from '../../utils/diffTime';
import detailedTime from '../../utils/detailedTime';
import EthAddress from '../EthAddress';
import { Col, Row, Form } from 'react-bootstrap';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';
import { Direction } from '@nouns/prop-house-wrapper/dist/builders';
import { AuctionStatus } from '../../utils/auctionStatus';
import { useEffect, useState } from 'react';
import Modal, { ModalData } from '../Modal';
import { useAppSelector } from '../../hooks';
import isAuctionActive from '../../utils/isAuctionActive';

export enum ProposalCardStatus {
  Default,
  Voting,
  Winner,
}

const ProposalCard: React.FC<{
  proposal: StoredProposalWithVotes;
  auctionStatus: AuctionStatus;
  cardStatus: ProposalCardStatus;
  votesFor?: number;
  votesLeft?: number;
  handleUserVote: (direction: Direction, proposalId: number) => void;
  showResubmissionBtn: boolean;
  handleResubmission: (
    proposal: StoredProposal,
    auctionIdToSubmitTo: number,
    callback: () => void
  ) => void;
}> = (props) => {
  const {
    proposal,
    auctionStatus,
    cardStatus,
    votesFor,
    votesLeft,
    handleUserVote,
    showResubmissionBtn,
    handleResubmission,
  } = props;

  const navigate = useNavigate();
  const [resubmitAuctionId, setResubmitAuctionId] = useState<number>();
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<ModalData>();

  const activeAuctions = useAppSelector((state) =>
    state.propHouse.auctions.filter(isAuctionActive)
  );

  useEffect(() => {
    if (activeAuctions.length > 0) setResubmitAuctionId(activeAuctions[0].id);
  }, [activeAuctions]);

  const ctaButton = (
    <Row>
      <Col xs={12} className={classes.bottomContainer}>
        <div className={classes.votesCopyContainer}>
          {cardStatus === ProposalCardStatus.Voting && (
            <div className={classes.yourVotesCopy}>Your votes: {votesFor}</div>
          )}
          {/* <div className={classes.scoreCopy}>
            Score: {Math.trunc(proposal.score)}
          </div> */}
        </div>
        <div className={classes.votesButtonContainer}>
          <Button
            text="↑"
            bgColor={ButtonColor.Yellow}
            classNames={classes.voteBtn}
            onClick={() =>
              handleUserVote && handleUserVote(Direction.Up, proposal.id)
            }
            disabled={votesLeft === 0}
          />
          {/* <Button
            text="↓"
            bgColor={ButtonColor.Yellow}
            classNames={classes.voteBtn}
            onClick={() =>
              handleUserVote && handleUserVote(Direction.Down, proposal.id)
            }
            disabled={votesFor === 0 ? true : false}
          /> */}
        </div>
      </Col>
    </Row>
  );

  const resubmissionSuccessModalData = (fundingRoundId: number) => ({
    title: 'Success!',
    content: (
      <Row>
        <Col xl={12}>
          Your proposal has been resubmitted to funding round {fundingRoundId}
        </Col>
        <Col xl={12}>
          <Button
            text="View Round"
            bgColor={ButtonColor.White}
            onClick={() => {
              setShowModal(false);
              navigate(`/auction/${fundingRoundId}`);
            }}
          />
        </Col>
      </Row>
    ),
    onDismiss: () => setShowModal(false),
  });

  const resubmitModalData = {
    title: 'Resubmit Proposal',
    content: (
      <Row>
        {activeAuctions.length === 0 ? (
          <Col md={12}>
            Currently, there are no open funding rounds to resubmit your
            proposal to. Try again later!
          </Col>
        ) : (
          <>
            <Col md={12}>
              Resubmit to funding round:{'   '}
              <Form.Select
                className={classes.roundSelectionInput}
                size="sm"
                onChange={(event) => {
                  setResubmitAuctionId(Number(event.target.value));
                }}
              >
                {activeAuctions.map((auction, _) => {
                  return <option>{auction.id}</option>;
                })}
              </Form.Select>
            </Col>
            <Col md={12}>
              <Button
                text="Submit"
                bgColor={ButtonColor.Green}
                classNames={classes.resubmitProposalButton}
                onClick={() =>
                  resubmitAuctionId &&
                  handleResubmission(proposal, resubmitAuctionId, () =>
                    setModalData(
                      resubmissionSuccessModalData(resubmitAuctionId)
                    )
                  )
                }
              />
            </Col>
          </>
        )}
      </Row>
    ),
    onDismiss: () => setShowModal(false),
  };

  const resubmitProposalBtn = (
    <Button
      text="Resubmit"
      bgColor={ButtonColor.Pink}
      classNames={classes.cardResubmitBtn}
      onClick={() => {
        setModalData(resubmitModalData);
        setShowModal(true);
      }}
    />
  );

  return (
    <>
      {showModal && modalData && <Modal data={modalData} />}
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={clsx(
          cardStatus === ProposalCardStatus.Voting
            ? clsx(globalClasses.yellowBorder, classes.proposalCardVoting)
            : cardStatus === ProposalCardStatus.Winner
            ? globalClasses.pinkBorder
            : '',
          classes.proposalCard
        )}
      >
        <div className={classes.authorContainer}>
          <EthAddress address={proposal.address} />
          <span>proposed</span>
        </div>
        <div>
          <div className={classes.propCopy}>Proposal #{proposal.id}&nbsp;</div>
        </div>

        <Link to={`/proposal/${proposal.id}`} className={classes.title}>
          {proposal.title}
        </Link>

        <div className={classes.timestampAndlinkContainer}>
          {auctionStatus === AuctionStatus.AuctionVoting &&
          cardStatus !== ProposalCardStatus.Voting ? (
            <div className={classes.scoreCopy}>
              Score: {Math.trunc(proposal.score)}
            </div>
          ) : (
            <div
              className={classes.timestamp}
              title={detailedTime(proposal.createdDate)}
            >
              {diffTime(proposal.createdDate)}
            </div>
          )}

          <div className={clsx(classes.readMore)}>
            <Link
              to={`/proposal/${proposal.id}`}
              className={
                cardStatus === ProposalCardStatus.Voting
                  ? globalClasses.fontYellow
                  : globalClasses.fontPink
              }
            >
              Read more →
            </Link>
          </div>
        </div>
        {cardStatus === ProposalCardStatus.Voting && ctaButton}
        {showResubmissionBtn && resubmitProposalBtn}
      </Card>
    </>
  );
};

export default ProposalCard;
