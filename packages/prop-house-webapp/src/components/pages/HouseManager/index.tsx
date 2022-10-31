import classes from './HouseManager.module.css';
import { Col, Container, Row } from 'react-bootstrap';
import Card, { CardBgColor, CardBorderRadius } from '../../Card';
import { FaLink as LinkIcon } from 'react-icons/fa';

const HouseManager = () => {
  return (
    <>
      <Container>
        <Row className={classes.propCardsRow}>
          <Col xl={8} className={classes.cardsContainer}>
            <Card
              bgColor={CardBgColor.White}
              borderRadius={CardBorderRadius.thirty}
              classNames={classes.primaryCard}
            >
              <p className={classes.title}>Create and deploy the contract for your House</p>

              <hr className={classes.divider} />

              <div className={classes.nameHouseSection}>
                <div className={classes.imgContainer}>
                  <img src="tricolor.png" alt="drop-img-here" />
                </div>

                <div className={classes.inputs}>
                  <div className={classes.titleAndInput}>
                    <p className={classes.subtitle}>Name your House</p>
                    <input placeholder="ex. Nouns" />
                  </div>

                  <div className={classes.titleAndInput}>
                    <p className={classes.subtitle}>Add an image</p>
                    <input placeholder="ex. https://example.com/nouns.jpg" />
                    <span className={classes.inputNote}>
                      Enter a url for a hosted image to represents your House.
                    </span>
                  </div>
                </div>
              </div>

              <hr className={classes.divider} />

              <div className={classes.describeHouseSection}>
                <span className={classes.nameAndButton}>
                  <p className={classes.title}>Describe your House</p>
                  <button>
                    <LinkIcon size={10} />
                    <span>Add Link</span>
                  </button>
                </span>
                <textarea rows={5} placeholder="Tell everyone what your House is about" />
              </div>
            </Card>

            <Card
              bgColor={CardBgColor.White}
              borderRadius={CardBorderRadius.thirty}
              classNames={classes.secondaryCard}
            >
              <p>Create your House</p>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default HouseManager;
