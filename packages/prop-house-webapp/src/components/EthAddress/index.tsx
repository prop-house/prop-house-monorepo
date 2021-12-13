import clsx from "clsx";
import React from "react";
import { useAppSelector } from "../../hooks";
import trimEthAddress from "../../utils/trimEthAddress";
import classes from "./EthAddress.module.css";

const EthAddress: React.FC<{
  children: string;
  className?: string;
}> = (props) => {
	const etherscanHost = useAppSelector(state => state.configuration.etherscanHost)
	
	const buildAddressHref = (address: string) => [etherscanHost, "address", address].join('/')

	// TODO: handle ens reverse resolution
	const addressOrEnsName = props.children;

  return (
    <div className={clsx(props.className, classes.ethAddress)}>
			<a href={buildAddressHref(addressOrEnsName)} target="_blank">
      	{trimEthAddress(addressOrEnsName)}
			</a>
    </div>
  );
};

export default EthAddress;
