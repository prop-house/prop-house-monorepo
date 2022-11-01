import classes from './DeployContractStep.module.css';
import Divider from '../Divider';
import ManagerNamingSection from '../ManagerNamingSection';
import ManagerDescriptionSection from '../ManagerDescriptionSection';
import ManagerStrategiesSection from '../ManagerStrategiesSection';
import ManagerAllowlistSection from '../ManagerAllowlistSection';

const DeployContractStep = () => {
  return (
    <>
      <p className={classes.title}>Create and deploy the contract for your House</p>
      <Divider />
      <ManagerNamingSection />
      <Divider />
      <ManagerDescriptionSection />
      <Divider />
      <ManagerStrategiesSection />
      <Divider />
      <ManagerAllowlistSection />
    </>
  );
};

export default DeployContractStep;
