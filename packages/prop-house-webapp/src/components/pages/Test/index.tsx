import Davatar from "@davatar/react";
import { useEthers } from "@usedapp/core";

const Test: React.FC<{}> = () => {
  const address = "0xD19BF5F0B785c6f1F6228C72A8A31C9f383a49c4";
  const { library: provider } = useEthers();

  return (
    <>
      <h1>hello</h1>
      {/* {address && <Davatar size={24} address={address} provider={provider} />} */}
    </>
  );
};

export default Test;
