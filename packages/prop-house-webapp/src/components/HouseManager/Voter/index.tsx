import classes from './Voter.module.css';
import Group from '../Group';
import EthAddress from '../../EthAddress';
import { VotingStrategyType } from '@prophouse/sdk-react';
import { getTokenInfo } from '../utils/getTokenInfo';
import { useEffect, useState } from 'react';
import AddressAvatar from '../../AddressAvatar';
import Button, { ButtonColor } from '../../Button';
import { useEthersProvider } from '../../../hooks/useEthersProvider';

const Voter: React.FC<{
  type: string;
  address: string;
  multiplier?: number;
  isDisabled?: boolean;
  removeVoter: (address: string, type: string) => void;
}> = props => {
  const { type, address, multiplier, isDisabled, removeVoter } = props;

  const provider = useEthersProvider();
  const [tokenInfo, setTokenInfo] = useState({ name: '', image: '' });

  useEffect(() => {
    const fetchTokenInfo = async () => {
      const { name, image } = await getTokenInfo(address, provider);

      setTokenInfo({ name, image });
    };
    if (type !== VotingStrategyType.ALLOWLIST) fetchTokenInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, type]);

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
            <img src={tokenInfo.image} alt={tokenInfo.name} />

            <span>{tokenInfo.name} holders</span>
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
