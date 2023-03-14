import { useConnectModal } from '@rainbow-me/rainbowkit';
import Button, { ButtonColor } from '../Button';
import { useTranslation } from 'react-i18next';

const ConnectButton: React.FC<{
  text?: string;
  color?: ButtonColor;
  classNames?: string;
}> = props => {
  const { text, color, classNames } = props;
  const { t } = useTranslation();
  const { openConnectModal } = useConnectModal();

  return (
    <Button
      classNames={classNames}
      text={text ? text : t('connect')}
      onClick={openConnectModal}
      bgColor={color ? color : ButtonColor.Purple}
    />
  );
};

export default ConnectButton;
