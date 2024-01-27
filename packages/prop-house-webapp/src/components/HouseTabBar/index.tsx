import clsx from 'clsx';
import classes from './HouseTabBar.module.css';
import { Proposal, Round } from '@prophouse/sdk-react';

export enum SelectedTab {
  Rounds,
  Props,
}

const HouseTabBar: React.FC<{
  rounds: Round[];
  proposals: Proposal[];
  selectedTab: SelectedTab;
  setSelectedTab: React.Dispatch<React.SetStateAction<SelectedTab>>;
}> = ({ rounds, proposals, selectedTab, setSelectedTab }) => {
  const propsIsSelected = selectedTab === SelectedTab.Props;
  const roundsIsSelected = selectedTab === SelectedTab.Rounds;
  return (
    <div className={classes.tabBarContainer}>
      <div
        className={clsx(classes.tabOption, roundsIsSelected && classes.selected)}
        onClick={() => setSelectedTab(SelectedTab.Rounds)}
      >
        <span className={clsx(classes.tabOptionName, roundsIsSelected && classes.selected)}>
          Rounds
        </span>
        <span className={classes.tabOptionNumber}>{rounds?.length}</span>
      </div>
      <div
        className={clsx(classes.tabOption, propsIsSelected && classes.selected)}
        onClick={() => setSelectedTab(SelectedTab.Props)}
      >
        <span className={clsx(classes.tabOptionName, propsIsSelected && classes.selected)}>
          Awarded Proposals
        </span>
        <span className={classes.tabOptionNumber}>{proposals?.length}</span>
      </div>
    </div>
  );
};

export default HouseTabBar;
