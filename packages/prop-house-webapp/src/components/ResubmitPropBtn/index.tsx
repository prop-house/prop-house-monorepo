import classes from "./ResubmitPropBtn.module.css";
import { Row, Col, Form } from "react-bootstrap";
import { useAppSelector } from "../../hooks";
import isAuctionActive from "../../utils/isAuctionActive";
import { useState, useRef, useEffect } from "react";
import Button, { ButtonColor } from "../Button";
import {
  StoredProposal,
  Proposal,
} from "@nouns/prop-house-wrapper/dist/builders";
import { PropHouseWrapper } from "@nouns/prop-house-wrapper";
import Modal, { ModalData } from "../Modal";
import { useNavigate } from "react-router-dom";
import { useEthers } from "@usedapp/core";
import i18n from "i18next";
import { useTranslation, initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(initReactI18next)
  .use(HttpBackend)
  .init({
    backend: { loadPath: "/locales/{{lng}}.json" },
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

const ResubmitPropBtn: React.FC<{ proposal: StoredProposal }> = (props) => {
  const { proposal } = props;

  const [resubmitAuctionId, setResubmitAuctionId] = useState<number>();
  const [modalData, setModalData] = useState<ModalData>();
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const { library } = useEthers();
  const activeAuctions = useAppSelector((state) =>
    state.propHouse.auctions.filter(isAuctionActive)
  );
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));
  const { t } = useTranslation();

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  useEffect(() => {
    if (activeAuctions.length > 0) setResubmitAuctionId(activeAuctions[0].id);
  }, [activeAuctions]);

  const resubmitModalData = {
    title: `${t("resubmit")}`,
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
              Resubmit to funding round:{"   "}
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
                text={t("submit")}
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

  const resubmissionSuccessModalData = (fundingRoundId: number) => ({
    title: t("success"),
    content: (
      <Row>
        <Col xl={12}>
          {t("hasBeenResubmitted")} {fundingRoundId}
        </Col>
        <Col xl={12}>
          <Button
            text={t("viewRound")}
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

  const handleResubmission = async (
    proposal: StoredProposal,
    auctionIdToSubmitTo: number,
    callback: () => void
  ) => {
    try {
      await client.current.createProposal(
        new Proposal(
          proposal.title,
          proposal.who,
          proposal.what,
          proposal.tldr,
          proposal.links,
          auctionIdToSubmitTo
        )
      );
      callback();
    } catch (e) {
      console.log(`Error handling resubmission: ${e}`);
    }
  };

  return (
    <>
      {showModal && modalData && <Modal data={modalData} />}{" "}
      <Button
        text="Resubmit"
        bgColor={ButtonColor.Pink}
        classNames={classes.cardResubmitBtn}
        onClick={() => {
          setModalData(resubmitModalData);
          setShowModal(true);
        }}
      />
    </>
  );
};

export default ResubmitPropBtn;
