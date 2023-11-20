import classes from './AddAwardModal.module.css';
import React, { SetStateAction, useRef, useState } from 'react';
import Button, { ButtonColor } from '../../Button';
import Divider from '../../Divider';
import Group from '../Group';
import { AssetType } from '@prophouse/sdk-react';
import { EditableAsset } from '../AssetSelector';
import { assetTypeString } from '../../../utils/assetTypeToString';
import Modal from '../../Modal';
import AddEthAsset from '../AddEthAsset';
import AddErc20Asset from '../AddErc20Asset';
import AddTokenIdAsset from '../AddTokenIdAsset';

const AddAwardModal: React.FC<{
  asset: EditableAsset;
  modifyAward: React.Dispatch<SetStateAction<EditableAsset | undefined>>;
  handleAddOrSaveAward: (award: EditableAsset) => void;
  closeModal: React.Dispatch<SetStateAction<boolean>>;
}> = props => {
  const { asset, modifyAward: setAward, handleAddOrSaveAward, closeModal } = props;

  const [selectedAwardType, setSelectedAwardType] = useState<AssetType>(
    asset ? asset.assetType : AssetType.ETH,
  );

  const isDisabled = () => {
    const isEth = asset.assetType === AssetType.ETH;
    const isErc20 = asset.assetType === AssetType.ERC20;
    const isErc1155 = asset.assetType === AssetType.ERC1155;
    const isErc721 = asset.assetType === AssetType.ERC721;

    if (isErc20) return asset.address === '' || BigInt(asset.amount) <= 0;
    if (isEth) return BigInt(asset.amount) <= 0;
    if (isErc1155 || isErc721) return asset.tokenId === '';
  };

  const handleSelectAwardType = (selectedType: AssetType) => {
    setSelectedAwardType(selectedType);
    let updated: EditableAsset = {
      ...asset,
      assetType: selectedType,
      amount: '0',
      address: '',
      state: 'editing',
      error: '',
    };
    setAward(updated);
  };

  return (
    <Modal
      modalProps={{
        title: asset.state === 'editing' ? 'Edit award' : 'Add award',
        subtitle: '',
        body: (
          <div className={classes.container}>
            <Group row gap={8} classNames={classes.buttons}>
              {/** Award type buttons */}
              {[AssetType.ETH, AssetType.ERC20, AssetType.ERC721, AssetType.ERC1155].map(type => (
                <div className={classes.stratBtnContainer} key={type}>
                  <Button
                    classNames={classes.strategyButton}
                    text={assetTypeString(type)}
                    bgColor={selectedAwardType === type ? ButtonColor.Purple : ButtonColor.White}
                    onClick={() => handleSelectAwardType(type)}
                  />
                </div>
              ))}
            </Group>
            <Divider />
            <Group>
              {asset.assetType === AssetType.ETH ? (
                <AddEthAsset asset={asset} setAsset={setAward} />
              ) : asset.assetType === AssetType.ERC20 ? (
                <AddErc20Asset asset={asset} setAsset={setAward} />
              ) : (
                <AddTokenIdAsset asset={asset} setAsset={setAward} />
              )}
            </Group>
          </div>
        ),
        button: (
          <Button
            text={asset.state === 'editing' ? 'Save changes' : 'Add award'}
            bgColor={ButtonColor.Purple}
            onClick={() => handleAddOrSaveAward(asset)}
            disabled={isDisabled()}
          />
        ),
        setShowModal: closeModal,
      }}
    />
  );
};

export default AddAwardModal;
