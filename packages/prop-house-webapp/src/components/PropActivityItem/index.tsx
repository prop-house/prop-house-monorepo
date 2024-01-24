import classes from './PropActivityItem.module.css';
import { useNavigate } from 'react-router-dom';
import { Proposal } from '@prophouse/sdk-react';
import { useEffect, useState } from 'react';
import getFirstImageFromProp from '../../utils/getFirstImageFromProp';
import { replaceIpfsGateway } from '../../utils/ipfs';

const PropActivityItem: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const navigate = useNavigate();

  const [imgUrlFromProp, setImgUrlFromProp] = useState<string | undefined>(undefined);

  useEffect(() => {
    let imgUrl;
    const getImg = async () => {
      imgUrl = await getFirstImageFromProp(proposal);
      setImgUrlFromProp(imgUrl);
    };
    getImg();
  }, [proposal]);
  return (
    <div onClick={() => navigate(`/${proposal.round}/${proposal.id}`)}>
      {imgUrlFromProp ? (
        <>
          <span>{proposal.title}</span>
          <div className={classes.propImgContainer}>
            <img
              src={replaceIpfsGateway(imgUrlFromProp)}
              crossOrigin="anonymous"
              alt="propCardImage"
            />
          </div>
        </>
      ) : (
        <>
          proposed&nbsp;
          <span>{proposal.title}</span>
        </>
      )}
    </div>
  );
};

export default PropActivityItem;
