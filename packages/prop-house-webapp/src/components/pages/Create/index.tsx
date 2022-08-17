import classes from './Create.module.css';
import { Row, Col } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ProposalEditor from '../../ProposalEditor';
import Preview from '../Preview';
import { clearProposal, patchProposal } from '../../../state/slices/editor';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { Proposal } from '@nouns/prop-house-wrapper/dist/builders';
import { appendProposal } from '../../../state/slices/propHouse';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import isAuctionActive from '../../../utils/isAuctionActive';
import { ProposalFields } from '../../../utils/proposalFields';
import useWeb3Modal from '../../../hooks/useWeb3Modal';
import Modal from '../../Modal';
import removeTags from '../../../utils/removeTags';
import { useTranslation } from 'react-i18next';

const isValidPropData = (data: ProposalFields) =>
  data.title.length > 4 &&
  removeTags(data.what).length > 49 &&
  data.tldr.length > 9 &&
  data.tldr.length < 121;

const Create: React.FC<{}> = () => {
  const { library: provider, account } = useEthers();
  const { t } = useTranslation();

  // auction to submit prop to is passed via react-router from propse btn
  const location = useLocation();
  const activeAuction = location.state.auction;
  const activeCommunity = location.state.community;

  const [showPreview, setShowPreview] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const proposalEditorData = useAppSelector(state => state.editor.proposal);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const connect = useWeb3Modal();

  const backendHost = useAppSelector(state => state.configuration.backendHost);

  const backendClient = useRef(new PropHouseWrapper(backendHost, provider?.getSigner()));

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(backendHost, provider?.getSigner());
  }, [provider, backendHost]);

  const onDataChange = (data: Partial<ProposalFields>) => {
    dispatch(patchProposal(data));
  };

  const submitProposal = async () => {
    if (!activeAuction || !isAuctionActive(activeAuction)) return;

    const proposal = await backendClient.current.createProposal(
      new Proposal(
        proposalEditorData.title,
        proposalEditorData.who,
        proposalEditorData.what,
        proposalEditorData.tldr,
        proposalEditorData.links,
        activeAuction.id,
      ),
    );
    dispatch(appendProposal({ proposal }));
    dispatch(clearProposal());
    setShowModal(true);
  };

  const successfulSubmissionModalContent = {
    title: t('congrats'),
    content: (
      <>
        <p>
          {`
          ${t(`successfulSubmission`)} \n
           ${activeCommunity && activeCommunity.name} ${`(${
            activeAuction && activeAuction.title
          })`}`}
        </p>
        <Button
          text={t('viewHouse')}
          bgColor={ButtonColor.White}
          onClick={() => navigate(`/${activeCommunity && activeCommunity.contractAddress}`)}
        />
      </>
    ),
    onDismiss: () => navigate(`/${activeCommunity && activeCommunity.contractAddress}`),
  };

  return activeAuction ? (
    <>
      {showModal && <Modal data={successfulSubmissionModalContent} />}

      <Row>
        <Col xl={12} className={classes.proposalHelperWrapper}>
          <h1 className={classes.proposalHelper}>
            {t('creatingProp')}{' '}
            <span>
              {t('fundingRound')} {`${activeAuction.id} (${activeAuction.fundingAmount} ETH)`}{' '}
            </span>
          </h1>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          {showPreview ? <Preview /> : <ProposalEditor onDataChange={onDataChange} />}
        </Col>
      </Row>

      <Row>
        <Col xl={12} className={classes.btnContainer}>
          <Button
            text={showPreview ? t('backToEditor') : t('preview')}
            bgColor={ButtonColor.Pink}
            onClick={() =>
              setShowPreview(prev => {
                return !prev;
              })
            }
            disabled={!isValidPropData(proposalEditorData)}
          />

          {showPreview &&
            (account ? (
              <Button
                classNames={classes.actionBtn}
                text={t('signSubmit')}
                bgColor={ButtonColor.Pink}
                onClick={submitProposal}
                disabled={!isValidPropData(proposalEditorData)}
              />
            ) : (
              <Button
                classNames={classes.actionBtn}
                bgColor={ButtonColor.Pink}
                text={t('connectWallet')}
                onClick={connect}
              />
            ))}
        </Col>
      </Row>
    </>
  ) : (
    <>Loading...</>
  );
};

export default Create;
