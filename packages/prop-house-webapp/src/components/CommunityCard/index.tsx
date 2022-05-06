import classes from './CommunityCard.module.css';
import img from '../../assets/gremp-lightbulb.png';
import { Link } from 'react-router-dom';

const CommunityCard: React.FC<{
  numProposals: number;
}> = (props) => {
  const { numProposals } = props;

  return (
    <div className={classes.container}>
      <Link to="">
        <img src={img} alt="community profile " className={classes.imageCard} />
      </Link>
      <div className={classes.infoContainer}>
        <div className={classes.title}>Nouns</div>
        <div className={classes.proposals}>
          <span>{numProposals}</span> props
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;
