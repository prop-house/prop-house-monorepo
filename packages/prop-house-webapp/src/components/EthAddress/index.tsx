import clsx from "clsx";
import React from "react";
import { useAppSelector } from "../../hooks";
import { useReverseENSLookUp } from "../../utils/ensLookup";
import trimEthAddress from "../../utils/trimEthAddress";
import classes from "./EthAddress.module.css";
import Davatar from "@davatar/react";
import { useEthers } from "@usedapp/core";

const EthAddress: React.FC<{
  address: string;
  className?: string;
}> = (props) => {
  const { address } = props;
  const { library: provider } = useEthers();

  const etherscanHost = useAppSelector(
    (state) => state.configuration.etherscanHost
  );
  const buildAddressHref = (address: string) =>
    [etherscanHost, "address", address].join("/");

  const ens = useReverseENSLookUp(address);

  return (
    <div className={clsx(props.className, classes.ethAddress)}>
      <a href={buildAddressHref(address)} target="_blank" rel="noreferrer">
        <Davatar
          size={24}
          address={address}
          provider={provider}
          generatedAvatarType="blockies"
        />

        {ens ? ens : trimEthAddress(address)}
      </a>
    </div>
  );
};

export default EthAddress;
