import classes from "./RenderedProposalFields.module.css";
import { Row, Col } from "react-bootstrap";
import { ProposalFields } from "../../utils/proposalFields";
import EthAddress from "../EthAddress";
import ReactMarkdown from "react-markdown";
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

export interface RenderedProposalProps {
  fields: ProposalFields;
  address?: string;
  proposalId?: number;
  backButton?: React.ReactNode;
  communityName?: string;
}

const RenderedProposalFields: React.FC<RenderedProposalProps> = (props) => {
  const { fields, address, proposalId, backButton, communityName } = props;
  const { t } = useTranslation();

  return (
    <>
      <Row>
        <Col xl={12} className={classes.previewCol}>
          <div className={classes.headerContainer}>
            {backButton && backButton}

            <div>
              {address && proposalId && (
                <div className={classes.subinfo}>
                  {communityName &&
                    communityName.charAt(0).toUpperCase() +
                      communityName.slice(1) +
                      " • "}
                  {t("prop")} #{proposalId}{" "}
                  <span className={classes.propSpacer}>&nbsp;•&nbsp;</span>
                  <div className={classes.submittedBy}>
                    {t("submittedBy")}&nbsp;
                    <EthAddress address={address} />
                  </div>
                </div>
              )}

              <h1>{fields.title}</h1>
            </div>
          </div>
          <hr></hr>
          <h2>{t("tldr2")}</h2>
          <ReactMarkdown
            className={classes.markdown}
            children={fields.tldr}
          ></ReactMarkdown>
          <h2>{t("description")}</h2>
          <ReactMarkdown
            className={classes.markdown}
            children={fields.what}
          ></ReactMarkdown>
        </Col>
      </Row>
    </>
  );
};

export default RenderedProposalFields;
