import classes from '../TimedRoundAcceptingPropsModule/TimedRoundAcceptingPropsModule.module.css';
import RoundModuleCard from '../RoundModuleCard';

const RoundModuleCancelled: React.FC<{}> = props => {
  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <p>
            The round admin has cancelled the round. If you have questions, please reach out to the
            corresponding round creator.
          </p>
        </div>
      </div>
    </>
  );

  return (
    <RoundModuleCard
      title={'Round was cancelled'}
      subtitle={<>Admin ended the game</>}
      content={content}
      type="cancelled"
    />
  );
};

export default RoundModuleCancelled;
