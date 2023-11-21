import classes from './Voter.module.css';
import Group from '../Group';
import EthAddress from '../../EthAddress';
import { Asset, AssetType, VotingStrategyType } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import AddressAvatar from '../../AddressAvatar';
import Button, { ButtonColor } from '../../Button';
import { useEthersProvider } from '../../../hooks/useEthersProvider';
import useAddressType from '../../../hooks/useAddressType';
import useAssetImages from '../../../hooks/useAssetImages';
import useAssetNames from '../../../hooks/useAssetNames';

const Voter: React.FC<{
  type: string;
  address: string;
  multiplier?: number;
  tokenId?: string;
  isDisabled?: boolean;
  removeVoter: (address: string, type: string) => void;
}> = props => {
  const { type, address, tokenId, multiplier, isDisabled, removeVoter } = props;

  // TODO: Refactor hack that takes NewVoter and converts it to an Asset to use available hooks
  const contractType = useAddressType(address);
  const [wrapperAsset, setWrapperAsset] = useState<Asset>();
  const images = useAssetImages([wrapperAsset ?? ({} as Asset)]);
  const name = useAssetNames([wrapperAsset ?? ({} as Asset)]);

  useEffect(() => {
    if (!contractType || wrapperAsset) return;

    const { data: type } = contractType;

    const assetType =
      type === 'ERC721'
        ? AssetType.ERC721
        : type === 'ERC20'
        ? AssetType.ERC20
        : type === 'ERC1155'
        ? AssetType.ERC1155
        : undefined;
    if (!assetType) return;

    let _wrapperAsset = {
      assetType,
      address: address,
      tokenId: tokenId ? tokenId : '1',
      amount: '0',
    } as Asset;
    setWrapperAsset(_wrapperAsset);
  }, [contractType]);

  return (
    <Group row gap={15} classNames={classes.row}>
      <div className={classes.addressSuccess}>
        {type === VotingStrategyType.ALLOWLIST ? (
          // if it's a whitelist use, show the ENS & avatar
          <Group row gap={4} classNames={classes.ens}>
            <AddressAvatar address={address} size={16} />

            <EthAddress address={address} />
          </Group>
        ) : (
          // otherwise, show the token image & name
          <div className={classes.addressImgAndTitle}>
            <img src={images ? images[0] : ''} alt={name ? name[0] : ''} />

            <span>{name ? name[0] : ''} holders</span>
          </div>
        )}

        <div className={classes.votesText}>
          {/* tokens show x-vote(s), users show "vote(s) per token" */}
          {`${multiplier} vote${multiplier === 1 ? '' : 's'}${
            type !== VotingStrategyType.ALLOWLIST ? ' / token' : ''
          }`}
        </div>
      </div>

      {/* we have two because on mobile we want to show the X,
      and on desktop we want the button text to be "Remove" */}
      <Button
        // unicode for the X
        text="&#x2715;"
        classNames={classes.xButtonMobile}
        bgColor={ButtonColor.White}
        disabled={isDisabled}
        onClick={() => removeVoter(address, type)}
      />

      <Button
        text="Remove"
        classNames={classes.xButtonDesktop}
        bgColor={ButtonColor.White}
        disabled={isDisabled}
        onClick={() => removeVoter(address, type)}
      />
    </Group>
  );
};

export default Voter;
