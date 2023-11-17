import classes from './IndividualAwards.module.css';
import Text from '../Text';
import Group from '../Group';
import { NewRound } from '../../../state/slices/round';
import { useDispatch } from 'react-redux';
import { AssetType } from '@prophouse/sdk-react';
import Button, { ButtonColor } from '../../Button';
import { EditableAsset, newAward } from '../AssetSelector';
import { SetStateAction, useState } from 'react';
import { useAppSelector } from '../../../hooks';
import AwardWithPlace from '../AwardWithPlace';
import AwardRow from '../AwardRow';
import { saveRound } from '../../../state/thunks';
import { v4 as uuidv4 } from 'uuid';
import AddAwardModal from '../AddAwardModal';

/**
 * @see editMode is used to determine whether or not we're editing from Step 6,
 * in which case we don't want to dispatch the saveRound thunk, rather we want to
 * track the changes in the parent component and dispatch the saveRound thunk
 * when the user clicks "Save Changes"
 */

const IndividualAwards: React.FC<{
  editMode?: boolean;
  awards: EditableAsset[];
  setAwards: React.Dispatch<SetStateAction<EditableAsset[]>>;
  editedRound?: NewRound;
  setEditedRound?: React.Dispatch<React.SetStateAction<NewRound>>;
}> = props => {
  const { editMode, awards, setAwards, editedRound, setEditedRound } = props;

  const [showIndividualAwardModal, setShowIndividualAwardModal] = useState(false);
  const [awardBeingAddedOrEdited, setAwardBeingAddedOrEdited] = useState<EditableAsset>();

  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const handleSaveAward = async (award: EditableAsset) => {
    const isDuplicateErc721 = awards.some(
      a =>
        award.assetType === AssetType.ERC721 &&
        a.assetType === AssetType.ERC721 &&
        a.address === award.address &&
        a.tokenId === award.tokenId,
    );

    if (isDuplicateErc721) {
      setAwardBeingAddedOrEdited({
        ...award,
        state: 'error',
        error: `An award with ${award.address} #${award.tokenId} already exists`,
      });
      return;
    }

    let updated: Partial<EditableAsset>;

    updated = {
      ...award,
      state: 'saved',
    };

    const updatedAwards: EditableAsset[] = awards.map(a => {
      return a.id === award.id ? { ...a, ...updated } : { ...a };
    });

    if (editMode) {
      const filteredAwards = updatedAwards.filter(award => award.state === 'saved');
      setEditedRound!({
        ...editedRound!,
        numWinners: filteredAwards.length,
        awards: filteredAwards,
      });
    } else {
      setAwards(updatedAwards);
      dispatch(
        saveRound({
          ...round,
          numWinners: updatedAwards.length,
          awards: updatedAwards,
        }),
      );
    }

    setShowIndividualAwardModal(false);
  };

  const addNewAwardFiller = () => {
    const updatedAwards = [...awards, { ...newAward, id: uuidv4() }];

    if (editMode) {
      setEditedRound!({
        ...editedRound!,
        numWinners: updatedAwards.length,
        awards: updatedAwards,
      });
    } else {
      setAwards(updatedAwards);
    }
  };

  const removeAward = (id: string) => {
    let updated: EditableAsset[] = awards.filter(award => award.id !== id);

    if (editMode) {
      const filteredAwards = updated.filter(award => award.state === 'saved');

      setEditedRound!({
        ...editedRound!,
        numWinners: filteredAwards.length,
        awards: filteredAwards,
      });
    } else {
      dispatch(saveRound({ ...round, numWinners: updated.length, awards: updated }));
      setAwards(updated);
    }
  };

  return (
    <>
      {showIndividualAwardModal && awardBeingAddedOrEdited && (
        <AddAwardModal
          award={awardBeingAddedOrEdited}
          modifyAward={setAwardBeingAddedOrEdited}
          handleAddOrSaveAward={handleSaveAward}
          closeModal={setShowIndividualAwardModal}
        />
      )}
      <Group gap={16}>
        {awards.map((award, idx) => {
          return (
            <Group key={award.id} gap={8}>
              <AwardWithPlace place={idx + 1} />
              <Group row gap={8}>
                {award.state !== 'dummy' && <AwardRow award={award} />}
                {/** add award or edit btns */}
                {award.state === 'dummy' ? (
                  <Button
                    text="Add award"
                    bgColor={ButtonColor.White}
                    classNames={classes.awardBtn}
                    onClick={() => {
                      setShowIndividualAwardModal(true);
                      setAwardBeingAddedOrEdited(awards[idx]);
                    }}
                  />
                ) : (
                  <Button
                    text="Edit"
                    classNames={classes.awardBtn}
                    bgColor={ButtonColor.White}
                    onClick={() => {
                      setShowIndividualAwardModal(true);
                      setAwardBeingAddedOrEdited({ ...awards[idx], state: 'editing' });
                    }}
                  />
                )}
                {/** remove btn (if not first place award) */}
                {idx !== 0 && (
                  <Button
                    text="Remove"
                    bgColor={ButtonColor.White}
                    onClick={() => removeAward(award.id)}
                  />
                )}
              </Group>
            </Group>
          );
        })}
        <Text type="link" onClick={addNewAwardFiller}>
          Add more awards
        </Text>
      </Group>
    </>
  );
};

export default IndividualAwards;
