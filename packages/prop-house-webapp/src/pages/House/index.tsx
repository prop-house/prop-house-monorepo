import classes from './House.module.css';
import { useAppSelector } from '../../hooks';
import HouseHeader from '../../components/HouseHeader';
import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Proposal, Round, usePropHouse } from '@prophouse/sdk-react';
import { CardType, cardServiceUrl } from '../../utils/cardServiceUrl';
import OpenGraphElements from '../../components/OpenGraphElements';
import { COMPLETED_ROUND_OVERRIDES, HIDDEN_ROUND_OVERRIDES } from '../../utils/roundOverrides';
import { removeHtmlFromString } from '../../utils/removeHtmlFromString';
import JumboRoundCard from '../../components/JumboRoundCard';
import HouseTabBar, { SelectedTab } from '../../components/HouseTabBar';
import HousePropCard from '../../components/HousePropCard';

const House: React.FC<{}> = () => {
  const propHouse = usePropHouse();

  const house = useAppSelector(state => state.propHouse.activeHouse);
  const [rounds, setRounds] = useState<Round[]>();
  const [props, setProps] = useState<Proposal[]>();
  const [selectedTab, setSelectedTab] = useState<SelectedTab>(SelectedTab.Rounds);

  // fetch rounds
  useEffect(() => {
    if (!house || rounds) return;

    const fetchRounds = async () => {
      const rounds = (await propHouse.query.getRoundsForHouse(house.address))
        .map(round => {
          if (COMPLETED_ROUND_OVERRIDES[round.address]) {
            round.state = COMPLETED_ROUND_OVERRIDES[round.address].state;
          }
          return round;
        })
        .filter(round => !HIDDEN_ROUND_OVERRIDES.includes(round.address));
      setRounds(rounds);
    };
    fetchRounds();
  }, [house, propHouse.query, rounds]);

  // fetch winning props
  useEffect(() => {
    if (!rounds || props) return;

    const fetchWinningProps = async () => {
      const props = await propHouse.query.getProposals({
        where: { round_: { sourceChainRound_in: rounds.map(r => r.address) }, isWinner: true },
      });
      setProps(props);
    };

    fetchWinningProps();
  });

  return (
    <>
      {house && (
        <OpenGraphElements
          title={house && house.name ? house.name : ''}
          description={removeHtmlFromString(house.description ?? '')}
          imageUrl={cardServiceUrl(CardType.house, house.address).href}
        />
      )}

      {house && (
        <>
          <Container>
            <HouseHeader house={house} />
          </Container>
          <div className={classes.stickyContainer}>
            <Container>
              <HouseTabBar
                rounds={rounds ?? []}
                proposals={props ?? []}
                selectedTab={selectedTab}
                setSelectedTab={setSelectedTab}
              />
            </Container>
          </div>

          <div className={classes.houseContainer}>
            <Container>
              <Row>
                {selectedTab === SelectedTab.Rounds
                  ? rounds &&
                    rounds.map((round, index) => (
                      <Col key={index} xl={6}>
                        <JumboRoundCard round={round} house={house} />
                      </Col>
                    ))
                  : props &&
                    props.map((prop, i) => (
                      <Col xl={4}>
                        <HousePropCard proposal={prop} />
                      </Col>
                    ))}
              </Row>
            </Container>
          </div>
        </>
      )}
    </>
  );
};

export default House;
