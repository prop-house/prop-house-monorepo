import classes from './HouseSelection.module.css';
import React, { useState, useEffect } from 'react';
import { PropHouse } from '@prophouse/sdk';

import Group from '../Group';
import clsx from 'clsx';
import Text from '../Text';
import { HiOutlineChevronRight as ArrowIcon } from 'react-icons/hi';
import Divider from '../../Divider';
import { v4 as uuidv4 } from 'uuid';
import trimEthAddress from '../../../utils/trimEthAddress';

interface HouseSelectionProps {
  propHouse: PropHouse;
  onSelectHouse: (house: FetchedHouse) => void;
  handleCreateNewHouseClick: () => void;
}

export interface FetchedHouse {
  __typename?: 'House' | undefined;
  id: string;
  name?: string | null | undefined;
  description?: string | null | undefined;
  imageURI?: string | null | undefined;
  createdAt: any;
  roundCount: number;
}

const HouseSelection: React.FC<HouseSelectionProps> = ({
  propHouse,
  onSelectHouse,
  handleCreateNewHouseClick,
}) => {
  const [houses, setHouses] = useState<FetchedHouse[]>([]);

  // const [newHouseImage, setNewHouseImage] = useState<File | null>(null);

  useEffect(() => {
    async function fetchHouses() {
      try {
        const fetchedHouses = await propHouse.query.getHouses().then(data => data.houses);
        if (fetchedHouses) console.log('fetchedHouses', fetchedHouses);
        if (fetchedHouses) setHouses(fetchedHouses);

        // if (fetchedHouses) {
        //   const updatedHouses = await Promise.all(
        //     fetchedHouses.map(async (house: any) => {
        //       const rounds = await propHouse.query
        //         .getRoundsForHouse(house.address)
        //         .then(data => data.rounds);

        //       return {
        //         ...house,
        //         name: house.name,
        //         image: house.imageURI,
        //         address: house.address,
        //         roundCount: rounds.length,
        //       };
        //     }),
        // );
      } catch (error) {
        console.error('Error fetching houses:', error);
      }
    }
    fetchHouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ipfsToHttpsURL(ipfsURI: string, gateway: string = 'https://ipfs.io'): string {
    if (!ipfsURI.startsWith('ipfs://')) {
      throw new Error('Invalid IPFS URI.');
    }

    const ipfsHash = ipfsURI.substring(7);
    return `${gateway}/ipfs/${ipfsHash}`;
  }

  return (
    <>
      <Group>
        <Group gap={8}>
          {houses.length
            ? houses.map(house => (
                <button key={uuidv4()} onClick={() => onSelectHouse(house)} className={classes.row}>
                  <Group row gap={8}>
                    <img
                      className={classes.img}
                      src={house.imageURI ? ipfsToHttpsURL(house.imageURI) : ''}
                      alt={house.name ? house.name : ''}
                    />
                    <Group classNames={classes.textContainer} gap={2}>
                      <Text type="subtitle" classNames={classes.houseName}>
                        {house.name}
                      </Text>
                      <Text type="body" classNames={classes.houseInfo}>
                        {house.roundCount} round{house.roundCount === 1 ? '' : 's'} •{' '}
                        {trimEthAddress(house.id)}{' '}
                      </Text>
                    </Group>
                  </Group>

                  <ArrowIcon className={classes.icon} />
                </button>
                // <div key={uuidv4()} onClick={() => onSelectHouse(house)}>
                // <img
                //   src={house.imageURI ? house.imageURI : ''}
                //   alt={house.name ? house.name : ''}
                // />
                //   <h3>{house.name}</h3>
                //   <p>
                //     {house.roundCount} rounds | {trimEthAddress(house.id)}
                //   </p>
                // </div>
              ))
            : 'NO HOUSES'}
        </Group>

        <span className={classes.message}>
          Not seeing a house? You need to have a{' '}
          <a href="https://prop.house/" target="_blank" rel="noopener noreferrer">
            creator pass
          </a>{' '}
          or{' '}
          <a href="https://prop.house/" target="_blank" rel="noopener noreferrer">
            house owner nft
          </a>
          .
        </span>

        <Divider />

        <button
          onClick={handleCreateNewHouseClick}
          className={clsx(classes.row, classes.createNew)}
        >
          <Group row gap={8}>
            <img className={classes.img} src="/manager/addNew.png" alt="Create a new house" />
            <Text type="subtitle">Create a new house</Text>
          </Group>

          <ArrowIcon className={classes.icon} />
        </button>
      </Group>
    </>
  );
};

export default HouseSelection;
