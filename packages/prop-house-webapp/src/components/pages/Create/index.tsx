import classes from "./Create.module.css";
import Card, { CardBgColor, CardBorderRadius } from "../../Card";
import { Row, Col } from "react-bootstrap";
import Button, { ButtonColor } from "../../Button";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ProposalEditor from "../../ProposalEditor";
import Preview from "../Preview";
import { clearProposal, patchProposal, ProposalFields, updateProposal } from "../../../state/slices/editor";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { Proposal, StoredAuction } from "@nouns/prop-house-wrapper/dist/builders";
import { addAuctions } from "../../../state/slices/propHouse";

const isValidPropData = (data: ProposalFields) => {
  return data.title !== "" && data.what !== "";
};

const Create = () => {
  const [showPreview, setShowPreview] = useState(false);
  const dispatch = useAppDispatch();
  const proposalEditorData = useAppSelector((state) => state.editor.proposal);
  const backendClient = useAppSelector((state) => state.backend.backend);
  const navigate = useNavigate();

  const onDataChange = (data: Partial<ProposalFields>) => {
    dispatch(patchProposal(data));
  };

  return (
    <>
      <Row>
        <Col xl={12}>
          <h1>Create proposal for Auction 1</h1>
          <p>Proposals will be voted by Nouners to get funded</p>
        </Col>
      </Row>
      <Card
        bgColor={CardBgColor.White}
        borderRadius={CardBorderRadius.twenty}
        classNames={classes.card}
      >
        <Row>
          <Col xl={10}>
            <p>
              We encourage proposals which further proliferate Nouns onto the
              world while accurately representing the Nouns culture. If your
              proposal is chosen, you will be given the responsibility of
              completing the work you’ve outlined below. Please be descriptive!
            </p>
          </Col>
          <Col xl={2}>
            <Link to="/learn">
              <Button text="Learn more" bgColor={ButtonColor.White} />
            </Link>
          </Col>
        </Row>
      </Card>

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
            text={showPreview ? "Back to editor" : "Preview"}
            bgColor={ButtonColor.Pink}
            onClick={() =>
              setShowPreview((prev) => {
                return !prev;
              })
            }
            disabled={!isValidPropData(proposalEditorData)}
          />
          <Button
            text="Submit"
            bgColor={ButtonColor.Pink}
            onClick={async () => {
              await backendClient.createProposal(
                new Proposal(
                  proposalEditorData.title,
                  proposalEditorData.who,
                  proposalEditorData.what,
                  proposalEditorData.timeline,
                  proposalEditorData.links,
                  // TODO: use current active
                  1
                )
              );
              await backendClient
                .getAuctions()
                .then((auctions: StoredAuction[]) =>
                  dispatch(addAuctions(auctions))
                );
              dispatch(clearProposal())
              navigate('/')
            }}
            disabled={!isValidPropData(proposalEditorData)}
          />
        </Col>
      </Row>
    </>
  );
};

export default Create;
