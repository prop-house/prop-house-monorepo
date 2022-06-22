import { useReverseENSLookUp } from "../../../utils/ensLookup";
import trimEthAddress from "../../../utils/trimEthAddress";

const Test: React.FC<{}> = () => {
  const address = "0xD19BF5F0B785c6f1F6228C72A8A31C9f383a49c4";

  // const ens = useReverseENSLookUp(address);
  console.log("ens", useReverseENSLookUp(address));

  // ens ? console.log("ens", ens) : console.log("trim:", trimEthAddress(address));

  return (
    <>
      <h1>hello</h1>
      {/* <Davatar size={24} address={address} />; */}
    </>
  );
};

export default Test;
