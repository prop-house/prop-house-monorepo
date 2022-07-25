import classes from "./Explore.module.css";
import { useState, useEffect, useRef } from "react";
import { PropHouseWrapper } from "@nouns/prop-house-wrapper";
import { useAppSelector } from "../../../hooks";
import { useEthers } from "@usedapp/core";
import { Community } from "@nouns/prop-house-wrapper/dist/builders";
import CommunityCard from "../../CommunityCard";
import { Row, Col } from "react-bootstrap";

const Explore = () => {
  const [communities, setCommunities] = useState<Community[]>([]);

  const { library } = useEthers();
  const host = useAppSelector((state) => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    client.current = new PropHouseWrapper(host, library?.getSigner());
  }, [library, host]);

  // fetch communities
  useEffect(() => {
    const getCommunities = async () => {
      const communities = await client.current.getCommunities();
      setCommunities(communities);
    };
    getCommunities();
  }, []);

  return (
    <>
      <Row>
        {communities.map((c) => (
          <Col xs={6} xl={3} className={classes.cardContainer}>
            <CommunityCard community={c} />
          </Col>
        ))}
      </Row>
    </>
  );
};

export default Explore;
