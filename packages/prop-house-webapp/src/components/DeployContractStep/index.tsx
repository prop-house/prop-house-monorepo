import Divider from '../Divider';
import ManagerNamingSection from '../ManagerNamingSection';
import ManagerDescriptionSection from '../ManagerDescriptionSection';
import ManagerStrategiesSection from '../ManagerStrategiesSection';
import ManagerAllowlistSection from '../ManagerAllowlistSection';

const DeployContractStep = () => {
  return (
    <>
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
