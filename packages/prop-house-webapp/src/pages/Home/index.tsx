import classes from './Home.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import headerImg from '../../assets/files/Props_FIN11.png';
import phCity from '../../assets/files/ph-city.png';
import alien from '../../assets/files/alien.png';
import hand from '../../assets/files/hand.png';
import moon from '../../assets/files/moon.png';
import Button, { ButtonColor } from '../../components/Button';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <>
      <Container>
        <Row className={classes.headerRow}>
          <Col lg={8}>
            <div className={classes.title}>Prop House</div>
            <p className={classes.subtitle}>
              A simple and fun way to award builders. Set up a round, tell the internet and watch
              magic happen.
            </p>
            <div className={classes.btnContainer}>
              <Button
                text="Create a round"
                bgColor={ButtonColor.White}
                onClick={() => navigate('/create-round')}
              />
              <Button
                text="View rounds"
                bgColor={ButtonColor.Pink}
                onClick={() => navigate('/app')}
              />
            </div>
          </Col>
          <Col>
            <img src={headerImg} alt="header" className={classes.headerImg} />
          </Col>
        </Row>

        <div className={clsx(classes.breakOut, classes.statsRowContainer)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 128 1440 192"
            className={clsx(classes.statsRowSvgTop)}
          >
            <path
              fill-opacity="10"
              d="M0,160L80,176C160,192,320,224,480,218.7C640,213,800,171,960,154.7C1120,139,1280,149,1360,154.7L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
            ></path>
          </svg>
          <Container>
            <Row className={clsx(classes.breakOut, classes.statsRow)}>
              <Col>
                <div className={clsx(classes.statsContainer)}>
                  <div className={classes.statsItem}>
                    <div className={classes.stat}>$3M+</div>
                    <div className={classes.title}>USD awarded</div>
                  </div>
                  <div className={classes.statsItem}>
                    <div className={classes.stat}>300+</div>
                    <div className={classes.title}>rounds executed</div>
                  </div>
                  <div className={classes.statsItem}>
                    <div className={classes.stat}>8k+</div>
                    <div className={classes.title}>proposals submitted</div>
                  </div>
                  <div className={classes.statsItem}>
                    <div className={classes.stat}>25k+</div>
                    <div className={classes.title}>votes cast</div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 230"
            className={clsx(classes.statsRowSvgBottom)}
          >
            <path
              fill-opacity="1"
              d="M0,96L80,112C160,128,320,160,480,154.7C640,149,800,107,960,112C1120,117,1280,171,1360,197.3L1440,224L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"
            ></path>
          </svg>
        </div>

        <div className={clsx(classes.onchainCityRow, classes.breakOut)}>
          <Container>
            <Row>
              <Col sm={12} md={6} className={classes.onchainCityTitleCol}>
                <div className={classes.title}>Born in Nouns</div>
                <p className={classes.subtitle}>
                  Prop House is a project born and funded by Nouns. It serves as an open invitation
                  for all onchain communities to build the world they want to see.
                </p>
              </Col>
              <Col xs={12}>
                <img src={phCity} alt="onchain city" />
              </Col>
            </Row>
          </Container>
        </div>

        <Row className={classes.noPadding}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 230"
            className={clsx(classes.onchainCityRowSvgBottom, classes.breakOut)}
          >
            <path
              fill-opacity="1"
              d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,138.7C672,139,768,181,864,186.7C960,192,1056,160,1152,149.3C1248,139,1344,149,1392,154.7L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
            ></path>
          </svg>
        </Row>

        <Row className={classes.alienRow}>
          <Col md={12} className={classes.alienImgCol}>
            <img src={alien} alt="" />
          </Col>
          <Row>
            <Col lg={12}>
              <div className={classes.title}>Empower builders</div>
            </Col>
            <Row className={classes.featuresContainer}>
              <Col lg={4} className={classes.featureItem}>
                <b>Make it fun</b>
                <span>
                  Turn your boring bounty or grants program into a fun experience builders and
                  voters can can enjoy.
                </span>
              </Col>
              <Col lg={4} className={classes.featureItem}>
                <b>Awards</b>
                <span>
                  Use any type of asset to award builders - ETH, USDC or NFTs (and more). Anything
                  to get the people going.
                </span>
              </Col>
              <Col lg={4} className={classes.featureItem}>
                <b>Cross pollinate</b>
                <span>Let builders from all corners of Ethereum build for your community.</span>
              </Col>
              <Col lg={4} className={classes.featureItem}>
                <b>Transparent</b>
                <span>
                  Allow builders to see how winners are decided on through simple and transparent
                  voting.
                </span>
              </Col>
              <Col lg={4} className={classes.featureItem}>
                <b>Onchain & open source</b>
                <span>
                  From round creation to award claiming — the entire Prop House stack is onchain and
                  open source.
                </span>
              </Col>
              <Col lg={4} className={classes.featureItem}>
                <b>Simple</b>
                <span>
                  Enjoy an intuitive interace that makes clunky crypto apps a thing of the past.
                </span>
              </Col>
            </Row>
          </Row>
        </Row>

        <Row className={clsx(classes.noPadding, classes.roundsvgTopRow)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 230"
            className={clsx(classes.roundsRowSvgTop, classes.breakOut)}
          >
            <path
              fill-opacity="1"
              d="M0,96L60,117.3C120,139,240,181,360,170.7C480,160,600,96,720,90.7C840,85,960,139,1080,144C1200,149,1320,107,1380,85.3L1440,64L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
            ></path>
          </svg>
          <img src={hand} className={classes.hand} alt="hand" />
          <img src={moon} className={classes.moon} alt="moon" />
        </Row>

        <div className={clsx(classes.breakOut, classes.roundsRowContainer)}>
          <Container>
            <Row className={classes.roundsRow}>
              <Col xl={12} className={classes.roundRowTitle}>
                <div className={classes.title}>Explore now</div>
                <div className={classes.subtitle}>Discover what's being built with Prop House</div>
              </Col>
              <div className={classes.btnContainer}>
                <Button
                  text="Explore rounds"
                  bgColor={ButtonColor.White}
                  onClick={() => navigate('/app')}
                />
                <Button
                  text="Discover communities"
                  bgColor={ButtonColor.Pink}
                  onClick={() => navigate('/communities')}
                />
              </div>
            </Row>
          </Container>
        </div>
      </Container>
    </>
  );
};

export default Home;
