import classes from './Create.module.css';
import { Row, Col, Container } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import { useLocation } from 'react-router-dom';
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
import removeTags from '../../../utils/removeTags';
import { useTranslation } from 'react-i18next';
import FundingAmount from '../../FundingAmount';
import LoadingIndicator from '../../LoadingIndicator';
import ProposalSuccessModal from '../../ProposalSuccessModal';
import NavBar from '../../NavBar';


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
  const [propId, setPropId] = useState<null | number>(null);
  const [showProposalSuccessModal, setShowProposalSuccessModal] = useState(false);

  const proposalEditorData = useAppSelector(state => state.editor.proposal);
  const dispatch = useAppDispatch();
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
        proposalEditorData.what,
        proposalEditorData.tldr,
        activeAuction.id,
      ),
    );

    setPropId(proposal.id);
    dispatch(appendProposal({ proposal }));
    dispatch(clearProposal());
    setShowProposalSuccessModal(true);
  };

  return (
    <>
      {activeAuction ? (
        <>
          {showProposalSuccessModal && propId && (
            <ProposalSuccessModal
              showModal={showProposalSuccessModal}
              setShowModal={setShowProposalSuccessModal}
              proposalId={propId}
              house={activeCommunity.name}
              round={activeAuction.title}
            />
          )}

          <div className="gradientBg">
            <NavBar />
            <Container>
              <h1 className={classes.title}>Creating your proposal for</h1>

              <h1 className={classes.proposalTitle}>
                <span className={classes.boldLabel}>{activeAuction.title}</span> in the{' '}
                <span className={classes.boldLabel}>{activeCommunity.name}</span> house
              </h1>

              <span className={classes.fundingCopy}>
                <span className={classes.boldLabel}>{activeAuction.numWinners}</span> winners will
                be selected to receive{' '}
                <span className={classes.boldLabel}>
                  {' '}
                  <FundingAmount
                    amount={activeAuction.fundingAmount}
                    currencyType={activeAuction.currencyType}
                  />
                </span>
              </span>
            </Container>
          </div>

          <Container>
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
          </Container>
        </>
      ) : (
        <LoadingIndicator />
      )}
    </>
  );
};

export default Create;
