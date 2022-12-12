import { Row, Col, Tooltip, OverlayTrigger } from 'react-bootstrap';
import classes from './PropCardVotingModule.module.css';
import { ProposalCardStatus } from '../../utils/cardStatus';
import Button, { ButtonColor } from '../Button';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { canAllotVotes } from '../../utils/canAllotVotes';
import { allotVotes } from '../../state/slices/voting';
import { Direction, StoredProposal } from '@nouns/prop-house-wrapper/dist/builders';
import React, { useEffect, useState } from 'react';
import { votesForProp } from '../../utils/voteAllotment';
import { useTranslation } from 'react-i18next';

const PropCardVotingModule: React.FC<{
  proposal: StoredProposal;
  cardStatus: ProposalCardStatus;
}> = props => {
  const { proposal } = props;

  const voteAllotments = useAppSelector(state => state.voting.voteAllotments);
  const votingPower = useAppSelector(state => state.voting.votingPower);
  const submittedVotes = useAppSelector(state => state.voting.numSubmittedVotes);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const allottedVotesForProp = votesForProp(voteAllotments, proposal.id);
  const _canAllotVotes = canAllotVotes(votingPower, submittedVotes, voteAllotments);

  const [voteCount, setVoteCount] = useState(0);
  const [inputIsInFocus, setInputIsInFocus] = useState(false);
  const [displayWarningTooltip, setDisplayWarningTooltip] = useState(false);
  const [attemptedInputVotes, setAttemptedInputVotes] = useState(0);

  const isAllotting = () => allottedVotesForProp > 0 || inputIsInFocus;

  useEffect(() => {
    // clear input on successful vote
    setVoteCount(0);
  }, [submittedVotes]);

  // handles votes by clicking up/down arrows
  const handleClickVote = (e: any, direction: Direction) => {
    e.stopPropagation();
    setVoteCount(prev => (direction === Direction.Up ? prev + 1 : prev - 1));
    dispatch(
      allotVotes({
        proposalId: proposal.id,
        proposalTitle: proposal.title,
        direction: direction,
        weight: 1,
      }),
    );
  };

  // handle votes by text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const inputVotes = Number(value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'));

    if (inputVotes > 100000) return; // prevent overflow

    // if attempting to input more than allowed total votes
    if (inputVotes > votingPower - submittedVotes) {
      setAttemptedInputVotes(inputVotes);
      setDisplayWarningTooltip(true);
      setTimeout(() => {
        setDisplayWarningTooltip(false);
      }, 1500);
      return;
    }

    // reset prev allotment (reduce to 0)
    dispatch(
      allotVotes({
        proposalTitle: proposal.title,
        proposalId: proposal.id,
        direction: Direction.Down,
        weight: voteCount,
      }),
    );

    // handle allottment
    dispatch(
      allotVotes({
        proposalTitle: proposal.title,
        proposalId: proposal.id,
        direction: Direction.Up,
        weight: inputVotes,
      }),
    );

    setVoteCount(inputVotes);
  };

  return (
    <Row>
      <Col xs={12} className={classes.bottomContainer} onClick={(e: any) => e.stopPropagation()}>
        <div className={clsx(isAllotting() && classes.activelyAllotting)}>
          <OverlayTrigger
            show={displayWarningTooltip}
            placement="top"
            overlay={
              <Tooltip className={classes.tooltip}>
                <span className={classes.tooltipTitle}>
                  {t('youDontHave')} {attemptedInputVotes} {t('votesAvailable')}
                </span>
              </Tooltip>
            }
          >
            <input
              type="text"
              value={displayWarningTooltip ? attemptedInputVotes : voteCount}
              className={classes.votesAllottedInput}
              onChange={e => handleInputChange(e)}
              onFocus={() => setInputIsInFocus(true)}
            />
          </OverlayTrigger>
        </div>

        <div className={classes.voteBtns}>
          <Button
            text="↓"
            bgColor={isAllotting() ? ButtonColor.PurpleLight : ButtonColor.Gray}
            classNames={classes.voteBtn}
            onClick={e => handleClickVote(e, Direction.Down)}
            disabled={allottedVotesForProp === 0}
          />
          <Button
            text="↑"
            bgColor={isAllotting() ? ButtonColor.PurpleLight : ButtonColor.Gray}
            classNames={classes.voteBtn}
            onClick={e => handleClickVote(e, Direction.Up)}
            disabled={!_canAllotVotes}
          />
        </div>
      </Col>
    </Row>
  );
};

export default PropCardVotingModule;
