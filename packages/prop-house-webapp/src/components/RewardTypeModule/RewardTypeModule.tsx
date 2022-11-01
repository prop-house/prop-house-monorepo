import classes from './RewardTypeModule.module.css';
import Button, { ButtonColor } from '../Button';

const RewardTypeModule = () => {
  return (
    <>
      <div className={classes.rewardSection}>
        <p className={classes.subtitle}>Reward type</p>

        <div className={classes.rewardTypeButtons}>
          <Button text="ETH" bgColor={ButtonColor.Purple} />
          <Button text="ERC20" bgColor={ButtonColor.White} />
          <Button text="ERC721/ERC1155" bgColor={ButtonColor.White} />
        </div>
      </div>
    </>
  );
};

export default RewardTypeModule;
