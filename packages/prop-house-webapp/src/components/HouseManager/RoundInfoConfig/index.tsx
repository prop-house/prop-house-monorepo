import Header from '../Header';
import Footer from '../Footer';
import RoundFields from '../RoundFields';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { useEffect, useRef } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';
import { saveRound } from '../../../state/thunks';

/**
 * @overview
 * Step 2 - user sets the round name and description
 *
 * @function postContractURIToIpfs - uploads the contractURI to ipfs if the user is creating a new house
 *
 * @components
 * @name RoundFields - renders the round name and description fields, we abstract here to allow direct access to the fields in the edit modal
 */

const RoundInfoConfig = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    if (round.house.existingHouse || round.house.contractURI !== '') {
      return;
    } else {
      postContractURIToIpfs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // We upload the contractURI to IPFS on step 2 since House info
  // isn't editable and this gives it more time to resolve by the
  // time the user creates the round and the contractURI is needed
  const postContractURIToIpfs = async () => {
    const contractURIObject = {
      name: round.house.title,
      description: round.house.description,
      image: round.house.image,
      external_link: `https://prop.house/${round.house.address}`,
      // these two below are constants
      seller_fee_basis_points: 0,
      fee_recipient: '0x0000000000000000000000000000000000000000',
    };

    const jsonString = JSON.stringify(contractURIObject);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });

    try {
      const res = await client.current.postFile(file, file.name);

      dispatch(
        saveRound({
          ...round,
          house: { ...round.house, contractURI: `ipfs://${res.data.ipfsHash}` },
        }),
      );
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <>
      <Header title="What's your round about?" />

      <RoundFields round={round} />

      <Footer />
    </>
  );
};

export default RoundInfoConfig;
