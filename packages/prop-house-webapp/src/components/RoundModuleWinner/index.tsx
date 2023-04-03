import { StoredInfiniteAuction } from '@nouns/prop-house-wrapper/dist/builders';
import React from 'react';
import RoundModuleCard from '../RoundModuleCard';

const RoundModuleWinner: React.FC<{ auction: StoredInfiniteAuction }> = ({ auction }) => {
  return (
    <RoundModuleCard
      title={'Winners'}
      content={
        <>
          <p style={{ fontWeight: 'bold' }}>What determines a winning proposal?</p>
          <br />
          <p>{`Proposals that meet the round quorum (${auction.quorum} votes) before the voting period ends.`}</p>
        </>
      }
      type="winner"
    />
  );
};

export default RoundModuleWinner;
