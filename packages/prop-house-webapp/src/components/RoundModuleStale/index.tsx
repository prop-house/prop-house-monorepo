import { StoredInfiniteAuction } from '@nouns/prop-house-wrapper/dist/builders';
import React from 'react';
import RoundModuleCard from '../RoundModuleCard';

const RoundModuleStale: React.FC<{ auction: StoredInfiniteAuction }> = ({ auction }) => {
  return (
    <RoundModuleCard
      title={'Stale'}
      content={
        <>
          <p style={{ fontWeight: 'bold' }}>What is a stale proposal?</p>
          <br />
          <p>{`Stale proposals are those that did not meet quorum (${auction.quorum} votes) within the round's voting period.`}</p>
        </>
      }
      type="stale"
    />
  );
};

export default RoundModuleStale;
