import classes from '../TimedRoundAcceptingPropsModule/TimedRoundAcceptingPropsModule.module.css';
import RoundModuleCard from '../RoundModuleCard';

const RoundModuleUnknownState: React.FC<{}> = props => {
  const content = (
    <>
      <div className={classes.list}>
        <div className={classes.listItem}>
          <p>The round state could not be determined. Please reach out to the team to review.</p>
        </div>
      </div>
    </>
  );

  return (
    <RoundModuleCard
      title={'Unknown state'}
      subtitle={<>Round vibe error</>}
      content={content}
      type="unknown"
    />
  );
};

export default RoundModuleUnknownState;
