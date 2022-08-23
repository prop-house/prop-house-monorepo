import { ethers } from 'ethers';
import CreateHouseENS from '../CreateHouseENS';
import CreateHouseMetaData from '../CreateHouseMetadata';
import CreateProposal from '../CreateProposal';
import CreateRound from '../CreateRound';
import CreateRoundENS from '../CreateRoundEns';

interface Window {
  ethereum: any;
}
const CreateDataCards = () => {
  const castedWindow = window as unknown as Window;
  const provider = new ethers.providers.Web3Provider(castedWindow.ethereum);
  const signer = provider.getSigner();

  const ens = 'nouns.eth';

  const cards = [
    <CreateHouseENS signer={signer} />,
    <CreateHouseMetaData signer={signer} ens={ens} />,
    <CreateRoundENS signer={signer} />,
    <CreateRound signer={signer} />,
    <CreateProposal provider={provider} />,
  ];

  return (
    <>
      {cards.map((card, index) => {
        return <div key={index}>{card}</div>;
      })}
    </>
  );
};

export default CreateDataCards;
