import classes from './Create.module.css';
import { Row, Col } from 'react-bootstrap';
import Button, { ButtonColor } from '../../Button';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import ProposalEditor from '../../ProposalEditor';
import Preview from '../Preview';
import { clearProposal, patchProposal } from '../../../state/slices/editor';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import {
  Proposal,
  StoredAuction,
} from '@nouns/prop-house-wrapper/dist/builders';
import { addAuctions } from '../../../state/slices/propHouse';
import { useEthers } from '@usedapp/core';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import isAuctionActive from '../../../utils/isAuctionActive';
import { ProposalFields } from '../../../utils/proposalFields';
import InspirationCard from '../../InspirationCard';

const isValidPropData = (data: ProposalFields) => {
  return data.title !== '' && data.what !== '';
};

const Create: React.FC<{}> = () => {
  const [parentAuction, setParentAuction] = useState<undefined | number>(
    undefined
  );
  const [showPreview, setShowPreview] = useState(false);
  const dispatch = useAppDispatch();
  const proposalEditorData = useAppSelector((state) => state.editor.proposal);
  const navigate = useNavigate();
  const { library: provider, account, activateBrowserWallet } = useEthers();
  const backendHost = useAppSelector(
    (state) => state.configuration.backendHost
  );
  const backendClient = useRef(
    new PropHouseWrapper(backendHost, provider?.getSigner())
  );
  const auctions = useAppSelector((state) => state.propHouse.auctions);

  useEffect(() => {
    if (parentAuction !== undefined) return;
    const openAuctions = auctions.filter(isAuctionActive);
    // Set to the first open Auction
    if (openAuctions.length > 0) setParentAuction(openAuctions[0].id);
  }, [auctions, parentAuction]);

  useEffect(() => {
    backendClient.current = new PropHouseWrapper(
      backendHost,
      provider?.getSigner()
    );
  }, [provider, backendHost]);

  const onDataChange = (data: Partial<ProposalFields>) => {
    dispatch(patchProposal(data));
  };

  return parentAuction ? (
    <>
      <InspirationCard />
      <Row>
        <Col xl={12}>
          <h1>Create proposal for Auction {parentAuction}</h1>
          <p>Proposals will be voted by Nouners to get funded</p>
        </Col>
      </Row>
      <Row>
        <Col xl={12}>
          {showPreview ? (
            <Preview />
          ) : (
            <ProposalEditor onDataChange={onDataChange} />
          )}
        </Col>
      </Row>

      <Row>
        <Col xl={12} className={classes.btnContainer}>
          <Button
            text={showPreview ? 'Back to editor' : 'Preview'}
            bgColor={ButtonColor.Pink}
            onClick={() =>
              setShowPreview((prev) => {
                return !prev;
              })
            }
            disabled={!isValidPropData(proposalEditorData)}
          />
          {account ? (
            <Button
              text="Sign and Submit"
              bgColor={ButtonColor.Pink}
              onClick={async () => {
                await backendClient.current.createProposal(
                  new Proposal(
                    proposalEditorData.title,
                    proposalEditorData.who,
                    proposalEditorData.what,
                    proposalEditorData.timeline,
                    proposalEditorData.links,
                    parentAuction
                  )
                );
                await backendClient.current
                  .getAuctions()
                  .then((auctions: StoredAuction[]) =>
                    dispatch(addAuctions(auctions))
                  );
                dispatch(clearProposal());
                navigate('/');
              }}
              disabled={!isValidPropData(proposalEditorData)}
            />
          ) : (
            <Button
              bgColor={ButtonColor.Pink}
              text="Connect Wallet To Submit"
              onClick={() => activateBrowserWallet()}
            />
          )}
        </Col>
      </Row>
    </>
  ) : (
    <>Loading...</>
  );
};

export default Create;
