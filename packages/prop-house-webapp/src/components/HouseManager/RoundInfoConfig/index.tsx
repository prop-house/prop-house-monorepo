import Header from '../Header';
import Footer from '../Footer';
import RoundFields from '../RoundFields';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '../../../hooks';
import { updateRound } from '../../../state/slices/round';
import { useEffect, useRef } from 'react';
import { PropHouseWrapper } from '@nouns/prop-house-wrapper';

const RoundInfoConfig = () => {
  const dispatch = useDispatch();
  const round = useAppSelector(state => state.round.round);

  const host = useAppSelector(state => state.configuration.backendHost);
  const client = useRef(new PropHouseWrapper(host));

  useEffect(() => {
    if (round.house.existingHouse || round.house.contractURI !== '') {
      return;
    } else {
      // upload contractURI to ipfs if the user is creating
      // a new house or if they have not already set one
      postContractURIToIpfs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postContractURIToIpfs = async () => {
    const contractURIObject = {
      name: round.house.title,
      description: round.house.description,
      image: round.house.image,
      external_link: `https://prop.house/${round.house.address}`,
      seller_fee_basis_points: 0,
      fee_recipient: '0x0000000000000000000000000000000000000000',
    };

    const jsonString = JSON.stringify(contractURIObject);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const file = new File([blob], 'metadata.json', { type: 'application/json' });

    try {
      const res = await client.current.postFile(file, file.name);

      dispatch(
        updateRound({
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
