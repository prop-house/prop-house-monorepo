import classes from './HouseSelection.module.css';
import React, { useState, useEffect } from 'react';
import { House, PropHouse } from '@prophouse/sdk-react';
import Group from '../Group';
import clsx from 'clsx';
import Text from '../Text';
import { HiOutlineChevronRight as ArrowIcon } from 'react-icons/hi';
import { v4 as uuidv4 } from 'uuid';
import { buildImageURL } from '../../../utils/buildImageURL';
import sanitizeHtml from 'sanitize-html';
import Markdown from 'markdown-to-jsx';
import { changeTagToParagraph, changeTagToSpan } from '../../ChangeTo';
import { useAccount } from 'wagmi';
import LoadingIndicator from '../../LoadingIndicator';

interface HouseSelectionProps {
  propHouse: PropHouse;
  onSelectHouse: (house: House) => void;
  handleCreateNewHouse: () => void;
}

const HouseSelection: React.FC<HouseSelectionProps> = ({
  propHouse,
  onSelectHouse,
  handleCreateNewHouse,
}) => {
  const { address: account } = useAccount();
  const [houses, setHouses] = useState<House[]>([]);
  const [loading, setLoading] = useState<boolean>(false); // Add loading state

  useEffect(() => {
    async function fetchHouses() {
      setLoading(true);

      try {
        propHouse.query
          // passing `as string` because Wagmi returns address as an 0x-prefixed string (`0x${string}`)
          .getHousesWhereAccountIsOwnerOrHasCreatorPermissions(account as string)
          .then(data => setHouses(data));
      } catch (error) {
        console.log('Error fetching houses:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHouses();
  }, [propHouse.query, account]);

  return (
    <>
      <Group>
        {loading ? (
          <LoadingIndicator />
        ) : houses.length ? (
          <Group gap={8} mt={6}>
            <Group gap={8} classNames={classes.houseContainer}>
              {houses.map(house => (
                <button key={uuidv4()} onClick={() => onSelectHouse(house)} className={classes.row}>
                  <Group row gap={8}>
                    <img
                      className={classes.img}
                      src={
                        house.imageURI
                          ? buildImageURL(house.imageURI).replace(
                              /prophouse.mypinata.cloud/g,
                              'cloudflare-ipfs.com',
                            )
                          : ''
                      }
                      alt={house.name ?? ''}
                    />
                    <Group classNames={classes.textContainer} gap={2}>
                      <Text type="subtitle" classNames={classes.houseName}>
                        {house.name ?? 'Untitled House'} • {house.roundCount} round
                        {house.roundCount === 1 ? '' : 's'}
                      </Text>
                      <Text type="body" classNames={classes.houseInfo}>
                        <Markdown
                          options={{
                            overrides: {
                              h1: changeTagToParagraph,
                              h2: changeTagToParagraph,
                              h3: changeTagToParagraph,
                              a: changeTagToSpan,
                              br: changeTagToSpan,
                            },
                          }}
                        >
                          {sanitizeHtml(house.description as any, {
                            allowedAttributes: { a: ['href', 'target'] },
                          })}
                        </Markdown>
                      </Text>
                    </Group>
                  </Group>

                  <ArrowIcon className={classes.icon} />
                </button>
              ))}
            </Group>
          </Group>
        ) : (
          <></>
        )}

        <button onClick={handleCreateNewHouse} className={clsx(classes.row, classes.createNew)}>
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
