import { StoredInfiniteAuction } from '@nouns/prop-house-wrapper/dist/builders';
import React from 'react';
import RoundModuleCard from '../RoundModuleCard';

const RoundModuleRejected: React.FC<{ auction: StoredInfiniteAuction }> = ({ auction }) => {
  return (
    <RoundModuleCard
      title={'Rejected'}
      content={
        <>
          <p style={{ fontWeight: 'bold' }}>What determines a rejected proposal?</p>
          <br />
          <p>{`Proposals that receive ${auction.quorumAgainst} or more against votes before the voting period ends.`}</p>
        </>
      }
      type="rejected"
    />
  );
};

export default RoundModuleRejected;
